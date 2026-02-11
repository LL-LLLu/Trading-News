import * as cheerio from "cheerio";
import { ScrapedEvent, EventCategory } from "@/types/events";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
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
    lower.includes("unemployment") ||
    lower.includes("adp")
  )
    return "EMPLOYMENT";
  if (
    lower.includes("cpi") ||
    lower.includes("ppi") ||
    lower.includes("inflation") ||
    lower.includes("price") ||
    lower.includes("pce")
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
    lower.includes("sentiment") ||
    lower.includes("michigan")
  )
    return "CONSUMER";
  if (
    lower.includes("trade") ||
    lower.includes("import") ||
    lower.includes("export") ||
    lower.includes("deficit") ||
    lower.includes("balance")
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
    lower.includes("petroleum") ||
    lower.includes("baker hughes")
  )
    return "ENERGY";
  return "OTHER";
}

function inferImportance(
  name: string,
  impact?: string
): "HIGH" | "MEDIUM" | "LOW" {
  // Use Finnhub impact field if available
  if (impact === "high") return "HIGH";
  if (impact === "medium") return "MEDIUM";
  if (impact === "low") return "LOW";

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

// Primary: Finnhub API (reliable, free tier)
export async function scrapeFromFinnhub(
  apiKey: string
): Promise<ScrapedEvent[]> {
  const now = new Date();
  const from = format(
    startOfWeek(now, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );
  const to = format(
    addDays(endOfWeek(now, { weekStartsOn: 1 }), 7),
    "yyyy-MM-dd"
  );

  const url = `${FINNHUB_BASE}/calendar/economic?from=${from}&to=${to}&token=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  const data = await response.json();
  const calendar = data.economicCalendar || [];

  return calendar
    .filter(
      (e: { country?: string }) =>
        e.country === "US" || e.country === "United States"
    )
    .map(
      (e: {
        event: string;
        time: string;
        actual?: number;
        estimate?: number;
        prev?: number;
        impact?: string;
        unit?: string;
        country?: string;
      }) => {
        const dateTime = new Date(e.time);
        const eventName = e.event || "Unknown Event";

        return {
          eventName,
          eventSlug: slugify(eventName),
          dateTime,
          actual:
            e.actual !== null && e.actual !== undefined
              ? String(e.actual)
              : undefined,
          forecast:
            e.estimate !== null && e.estimate !== undefined
              ? String(e.estimate)
              : undefined,
          previous:
            e.prev !== null && e.prev !== undefined
              ? String(e.prev)
              : undefined,
          unit: e.unit || undefined,
          importance: inferImportance(eventName, e.impact),
          category: categorizeEvent(eventName),
          sourceUrl: "https://finnhub.io",
        } satisfies ScrapedEvent;
      }
    );
}

// Fallback: MarketWatch HTML scraping
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

  // Try multiple possible table selectors
  const tableSelectors = [
    "table.table--economic-calendar tr",
    "table.calendar tr",
    ".economic-calendar table tr",
    "table tr",
  ];

  for (const selector of tableSelectors) {
    const rows = $(selector);
    if (rows.length === 0) continue;

    rows.each((_, row) => {
      const $row = $(row);
      const tds = $row.find("td");
      const ths = $row.find("th");

      // Date header row
      if (ths.length > 0 || (tds.length <= 2 && tds.length > 0)) {
        const text = (ths.text() || tds.text()).trim();
        if (text.match(/(Mon|Tue|Wed|Thu|Fri|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
          currentDate = text;
          return;
        }
      }

      if (tds.length < 3) return;

      const time = tds.eq(0).text().trim();
      const eventName = tds.eq(1).text().trim();
      if (!eventName || eventName.length < 3) return;

      const period = tds.eq(2).text().trim();
      const actual = tds.eq(3).text().trim();
      const forecast = tds.eq(4).text().trim();
      const previous = tds.eq(5).text().trim();

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
    });

    if (events.length > 0) break;
  }

  return events;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const cleanDate = dateStr.replace(/\./g, "").trim();
  const dateParsed = new Date(cleanDate);

  if (isNaN(dateParsed.getTime())) {
    const currentYear = new Date().getFullYear();
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

// Main scrape function - tries Finnhub first, falls back to MarketWatch
export async function scrapeEconomicCalendar(): Promise<ScrapedEvent[]> {
  const finnhubKey = process.env.FINNHUB_API_KEY;

  // Try Finnhub first
  if (finnhubKey) {
    try {
      const events = await scrapeFromFinnhub(finnhubKey);
      if (events.length > 0) {
        console.log(`Scraped ${events.length} events from Finnhub`);
        return events;
      }
    } catch (err) {
      console.error("Finnhub scrape failed, trying MarketWatch:", err);
    }
  }

  // Fallback to MarketWatch
  try {
    const events = await scrapeMarketWatch();
    if (events.length > 0) {
      console.log(`Scraped ${events.length} events from MarketWatch`);
      return events;
    }
  } catch (err) {
    console.error("MarketWatch scrape failed:", err);
  }

  return [];
}
