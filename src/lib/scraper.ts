import * as cheerio from "cheerio";
import { ScrapedEvent, EventCategory } from "@/types/events";

const MARKETWATCH_URL =
  "https://www.marketwatch.com/economy-politics/calendar";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categorizeEvent(name: string): EventCategory {
  const lower = name.toLowerCase();
  if (
    lower.includes("payroll") ||
    lower.includes("employment") ||
    lower.includes("jobless") ||
    lower.includes("jobs") ||
    lower.includes("labor") ||
    lower.includes("unemployment")
  )
    return "EMPLOYMENT";
  if (
    lower.includes("cpi") ||
    lower.includes("ppi") ||
    lower.includes("inflation") ||
    lower.includes("price")
  )
    return "INFLATION";
  if (lower.includes("gdp") || lower.includes("gross domestic"))
    return "GDP";
  if (
    lower.includes("manufacturing") ||
    lower.includes("ism") ||
    lower.includes("pmi") ||
    lower.includes("industrial") ||
    lower.includes("factory") ||
    lower.includes("durable")
  )
    return "MANUFACTURING";
  if (
    lower.includes("housing") ||
    lower.includes("home") ||
    lower.includes("building") ||
    lower.includes("construction") ||
    lower.includes("mortgage")
  )
    return "HOUSING";
  if (
    lower.includes("consumer") ||
    lower.includes("retail") ||
    lower.includes("spending") ||
    lower.includes("confidence") ||
    lower.includes("sentiment")
  )
    return "CONSUMER";
  if (
    lower.includes("trade") ||
    lower.includes("import") ||
    lower.includes("export") ||
    lower.includes("deficit")
  )
    return "TRADE";
  if (
    lower.includes("fed") ||
    lower.includes("fomc") ||
    lower.includes("rate") ||
    lower.includes("monetary") ||
    lower.includes("treasury") ||
    lower.includes("beige book")
  )
    return "MONETARY_POLICY";
  if (
    lower.includes("government") ||
    lower.includes("budget") ||
    lower.includes("fiscal")
  )
    return "GOVERNMENT";
  if (
    lower.includes("oil") ||
    lower.includes("energy") ||
    lower.includes("crude") ||
    lower.includes("gas") ||
    lower.includes("petroleum")
  )
    return "ENERGY";
  return "OTHER";
}

function inferImportance(name: string): "HIGH" | "MEDIUM" | "LOW" {
  const lower = name.toLowerCase();
  const highImpact = [
    "nonfarm payroll",
    "non-farm payroll",
    "unemployment rate",
    "cpi",
    "consumer price",
    "gdp",
    "fed",
    "fomc",
    "interest rate",
    "ppi",
    "retail sales",
    "ism manufacturing",
    "ism services",
    "pce",
    "personal consumption",
    "job openings",
    "jolts",
  ];
  const mediumImpact = [
    "housing starts",
    "building permits",
    "durable goods",
    "consumer confidence",
    "michigan",
    "trade balance",
    "industrial production",
    "existing home",
    "new home",
    "adp",
    "initial claims",
    "jobless claims",
    "wholesale",
    "import price",
    "export price",
    "beige book",
  ];

  if (highImpact.some((term) => lower.includes(term))) return "HIGH";
  if (mediumImpact.some((term) => lower.includes(term))) return "MEDIUM";
  return "LOW";
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  // dateStr format: "Feb. 10, 2025" or "February 10, 2025"
  // timeStr format: "8:30 a.m." or "10 a.m." or "2 p.m." or ""
  const currentYear = new Date().getFullYear();

  // Clean up date string
  const cleanDate = dateStr.replace(/\./g, "").trim();
  const dateParsed = new Date(cleanDate);

  if (isNaN(dateParsed.getTime())) {
    // Fallback: try current year
    const withYear = `${cleanDate} ${currentYear}`;
    const fallback = new Date(withYear);
    if (!isNaN(fallback.getTime())) {
      return applyTime(fallback, timeStr);
    }
    return new Date();
  }

  return applyTime(dateParsed, timeStr);
}

function applyTime(date: Date, timeStr: string): Date {
  if (!timeStr || timeStr.trim() === "") return date;

  const clean = timeStr.toLowerCase().replace(/\./g, "").trim();
  const match = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3];
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

export async function scrapeMarketWatch(): Promise<ScrapedEvent[]> {
  const response = await fetch(MARKETWATCH_URL, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(
      `MarketWatch fetch failed: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  return parseMarketWatchHTML(html);
}

export function parseMarketWatchHTML(html: string): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];
  let currentDate = "";

  // MarketWatch calendar uses a table structure
  // Date header rows contain the date, followed by event rows
  $("table.table--economic-calendar tr, table.calendar tr, .economic-calendar table tr").each(
    (_, row) => {
      const $row = $(row);

      // Check if this is a date header row
      const dateHeader =
        $row.find("th.cell--date, td.date-cell, th[colspan]").text().trim() ||
        $row.find("td:first-child").text().trim();

      // If the row has a date-like pattern and few cells, it's a date header
      const cells = $row.find("td, th");
      if (cells.length <= 2 && dateHeader.match(/\w+\.?\s+\d{1,2}/)) {
        currentDate = dateHeader;
        return;
      }

      // Try to extract event data from this row
      const tds = $row.find("td");
      if (tds.length < 3) return;

      // Try multiple MarketWatch table formats
      const time = tds.eq(0).text().trim();
      const eventName = tds.eq(1).text().trim() || tds.eq(0).text().trim();

      if (!eventName || eventName.length < 3) return;

      // Skip if it looks like a date header
      if (
        eventName.match(
          /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
        )
      )
        return;

      const period = tds.eq(2).text().trim() || undefined;
      const actual = tds.eq(3).text().trim() || undefined;
      const forecast = tds.eq(4).text().trim() || undefined;
      const previous = tds.eq(5).text().trim() || undefined;

      // Use a date if we have one, otherwise use today
      const dateTime = currentDate
        ? parseDateTime(currentDate, time)
        : new Date();

      events.push({
        eventName,
        eventSlug: slugify(eventName),
        dateTime,
        period: period && period !== "--" ? period : undefined,
        actual: actual && actual !== "--" ? actual : undefined,
        forecast: forecast && forecast !== "--" ? forecast : undefined,
        previous: previous && previous !== "--" ? previous : undefined,
        importance: inferImportance(eventName),
        category: categorizeEvent(eventName),
        sourceUrl: MARKETWATCH_URL,
      });
    }
  );

  // Also try parsing with a more generic approach if no events found
  if (events.length === 0) {
    return parseGenericCalendar($);
  }

  return events;
}

function parseGenericCalendar($: cheerio.CheerioAPI): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  let currentDate = "";

  // Try div-based layout that MarketWatch might use
  $("[class*='calendar'] [class*='row'], [class*='economic'] [class*='row']").each(
    (_, el) => {
      const $el = $(el);
      const text = $el.text().trim();

      // Check for date headers
      const dateMatch = text.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2}/i
      );
      if (dateMatch && text.length < 50) {
        currentDate = text;
        return;
      }

      // Try to extract structured data
      const children = $el.children();
      if (children.length >= 3) {
        const eventName = children.eq(1).text().trim() || children.eq(0).text().trim();
        if (eventName && eventName.length > 3) {
          const time = children.eq(0).text().trim();
          const dateTime = currentDate
            ? parseDateTime(currentDate, time)
            : new Date();

          events.push({
            eventName,
            eventSlug: slugify(eventName),
            dateTime,
            period: children.eq(2).text().trim() || undefined,
            actual: children.eq(3)?.text().trim() || undefined,
            forecast: children.eq(4)?.text().trim() || undefined,
            previous: children.eq(5)?.text().trim() || undefined,
            importance: inferImportance(eventName),
            category: categorizeEvent(eventName),
            sourceUrl: MARKETWATCH_URL,
          });
        }
      }
    }
  );

  return events;
}
