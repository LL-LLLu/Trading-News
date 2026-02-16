import { ScrapedEvent, EventCategory } from "@/types/events";
import { addDays, startOfWeek, endOfWeek, format } from "date-fns";

const FOREX_FACTORY_URL =
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

const TRADINGVIEW_CALENDAR_URL =
  "https://economic-calendar.tradingview.com/events";

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
    lower.includes("adp") ||
    lower.includes("jolts")
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
  impact?: string | number
): "HIGH" | "MEDIUM" | "LOW" {
  // TradingView uses numeric importance: 0=holiday, 1=medium/high, 2=high, 3=very high
  if (typeof impact === "number") {
    if (impact >= 2) return "HIGH";
    if (impact >= 1) return "MEDIUM";
    return "LOW";
  }

  if (typeof impact === "string") {
    const lower = impact.toLowerCase();
    if (lower === "high") return "HIGH";
    if (lower === "medium") return "MEDIUM";
    if (lower === "low") return "LOW";
  }

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
    "personal income",
    "personal spending",
  ];

  if (highImpact.some((term) => lower.includes(term))) return "HIGH";
  if (mediumImpact.some((term) => lower.includes(term))) return "MEDIUM";
  return "LOW";
}

// ── Forex Factory (current week, real data with actuals) ────────────

export async function scrapeFromForexFactory(): Promise<ScrapedEvent[]> {
  const response = await fetch(FOREX_FACTORY_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`Forex Factory fetch failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error(`Forex Factory returned non-JSON: ${contentType}`);
  }

  const data: Array<{
    title: string;
    country: string;
    date: string;
    impact: string;
    forecast: string;
    previous: string;
  }> = await response.json();

  return data
    .filter((e) => e.country === "USD")
    .map((e) => {
      const eventName = e.title || "Unknown Event";
      return {
        eventName,
        eventSlug: slugify(eventName),
        dateTime: new Date(e.date),
        actual: undefined,
        forecast:
          e.forecast && e.forecast.trim() ? e.forecast.trim() : undefined,
        previous:
          e.previous && e.previous.trim() ? e.previous.trim() : undefined,
        importance: inferImportance(eventName, e.impact),
        category: categorizeEvent(eventName),
        sourceUrl: "https://www.forexfactory.com/calendar",
      } satisfies ScrapedEvent;
    });
}

// ── TradingView Economic Calendar (accurate dates for upcoming weeks) ──

interface TradingViewEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  importance: number; // -1=holiday, 0=low, 1=medium, 2=high
  actual: number | null;
  forecast: number | null;
  previous: number | null;
  unit: string;
  indicator: string;
  category: string;
}

export async function scrapeFromTradingView(
  fromDate: Date,
  toDate: Date
): Promise<ScrapedEvent[]> {
  const from = fromDate.toISOString();
  const to = toDate.toISOString();
  const url = `${TRADINGVIEW_CALENDAR_URL}?from=${from}&to=${to}&countries=US`;

  const response = await fetch(url, {
    headers: {
      Origin: "https://www.tradingview.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`TradingView fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const events: TradingViewEvent[] = data.result || data;

  if (!Array.isArray(events)) {
    throw new Error("TradingView returned unexpected format");
  }

  // Filter: US events, importance >= 0 (exclude holidays at -1), deduplicate by title+date
  const seen = new Set<string>();
  const scraped: ScrapedEvent[] = [];

  for (const e of events) {
    if (e.importance < 0) continue; // skip holidays
    const eventName = e.title || "Unknown Event";
    const dateTime = new Date(e.date);
    const dateKey = `${slugify(eventName)}|${format(dateTime, "yyyy-MM-dd")}`;

    if (seen.has(dateKey)) continue;
    seen.add(dateKey);

    const formatValue = (val: number | null, unit: string): string | undefined => {
      if (val === null || val === undefined) return undefined;
      if (unit === "%") return `${val}%`;
      return String(val);
    };

    scraped.push({
      eventName,
      eventSlug: slugify(eventName),
      dateTime,
      actual: formatValue(e.actual, e.unit),
      forecast: formatValue(e.forecast, e.unit),
      previous: formatValue(e.previous, e.unit),
      unit: e.unit || undefined,
      importance: inferImportance(eventName, e.importance),
      category: categorizeEvent(eventName),
      sourceUrl: "https://www.tradingview.com/economic-calendar/",
    });
  }

  return scraped;
}

// ── Main scrape function ────────────────────────────────────────────

export async function scrapeEconomicCalendar(): Promise<ScrapedEvent[]> {
  const allEvents: ScrapedEvent[] = [];
  const seenKeys = new Set<string>();

  function addEvent(event: ScrapedEvent) {
    const key = `${event.eventSlug}|${format(event.dateTime, "yyyy-MM-dd")}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    allEvents.push(event);
  }

  // 1. Primary source: TradingView (accurate dates for current + upcoming weeks)
  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const futureEnd = endOfWeek(addDays(now, 8 * 7), { weekStartsOn: 1 });

    const tvEvents = await scrapeFromTradingView(weekStart, futureEnd);
    console.log(
      `[Scraper] TradingView: ${tvEvents.length} US events (${format(weekStart, "MMM d")} - ${format(futureEnd, "MMM d")})`
    );
    for (const e of tvEvents) addEvent(e);
  } catch (err) {
    console.error("[Scraper] TradingView scrape failed:", err);
  }

  // 2. Secondary source: Forex Factory (current week, may have more detail/actuals)
  try {
    const ffEvents = await scrapeFromForexFactory();
    console.log(
      `[Scraper] Forex Factory: ${ffEvents.length} USD events (current week)`
    );
    // FF events supplement TV data — add only if not already present
    for (const e of ffEvents) addEvent(e);
  } catch (err) {
    console.error("[Scraper] Forex Factory scrape failed:", err);
  }

  console.log(`[Scraper] Total unique events: ${allEvents.length}`);
  return allEvents;
}
