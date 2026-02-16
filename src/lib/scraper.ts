import { ScrapedEvent, EventCategory } from "@/types/events";
import {
  addMonths,
  startOfMonth,
  getDay,
  addDays,
  setHours,
  setMinutes,
  isAfter,
  endOfWeek,
  startOfWeek,
  isBefore,
} from "date-fns";

const FOREX_FACTORY_URL =
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

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
  if (impact) {
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
  ];

  if (highImpact.some((term) => lower.includes(term))) return "HIGH";
  if (mediumImpact.some((term) => lower.includes(term))) return "MEDIUM";
  return "LOW";
}

// ── Forex Factory (current week, real data) ─────────────────────────

export async function scrapeFromForexFactory(): Promise<ScrapedEvent[]> {
  const response = await fetch(FOREX_FACTORY_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Forex Factory fetch failed: ${response.status} ${response.statusText}${body.includes("Rate Limited") ? " (rate limited)" : ""}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error(
      `Forex Factory returned non-JSON response: ${contentType}`
    );
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
      const dateTime = new Date(e.date);
      return {
        eventName,
        eventSlug: slugify(eventName),
        dateTime,
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

// ── Forward Calendar Generator ──────────────────────────────────────
// Major US economic events follow known schedules. This generates
// placeholder events for the next several weeks so the dashboard
// always shows upcoming releases. Real data from Forex Factory
// overwrites these as each week arrives.

type DateRule =
  | { type: "nthWeekday"; n: number; weekday: number } // nth occurrence of weekday in month (0=Sun..6=Sat)
  | { type: "dayOfMonth"; day: number } // specific day (adjusted to nearest weekday)
  | { type: "lastWeekday"; weekday: number } // last occurrence of weekday in month
  | { type: "weekly"; weekday: number }; // every week on this day

interface ScheduledEvent {
  name: string;
  category: EventCategory;
  importance: "HIGH" | "MEDIUM" | "LOW";
  hour: number; // ET hour (24h)
  minute: number;
  rule: DateRule;
}

const KNOWN_SCHEDULE: ScheduledEvent[] = [
  // ── HIGH IMPACT ──
  {
    name: "Nonfarm Payrolls",
    category: "EMPLOYMENT",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "nthWeekday", n: 1, weekday: 5 }, // 1st Friday
  },
  {
    name: "Unemployment Rate",
    category: "EMPLOYMENT",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "nthWeekday", n: 1, weekday: 5 }, // 1st Friday (same day as NFP)
  },
  {
    name: "CPI m/m",
    category: "INFLATION",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 12 },
  },
  {
    name: "Core CPI m/m",
    category: "INFLATION",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 12 },
  },
  {
    name: "PPI m/m",
    category: "INFLATION",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 13 },
  },
  {
    name: "Retail Sales m/m",
    category: "CONSUMER",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 15 },
  },
  {
    name: "PCE Price Index m/m",
    category: "INFLATION",
    importance: "HIGH",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 28 },
  },
  {
    name: "ISM Manufacturing PMI",
    category: "MANUFACTURING",
    importance: "HIGH",
    hour: 10,
    minute: 0,
    rule: { type: "nthWeekday", n: 1, weekday: 1 }, // 1st business day ≈ 1st Monday
  },
  {
    name: "ISM Services PMI",
    category: "MANUFACTURING",
    importance: "HIGH",
    hour: 10,
    minute: 0,
    rule: { type: "nthWeekday", n: 1, weekday: 3 }, // ~3rd business day ≈ 1st Wednesday
  },
  {
    name: "JOLTS Job Openings",
    category: "EMPLOYMENT",
    importance: "HIGH",
    hour: 10,
    minute: 0,
    rule: { type: "nthWeekday", n: 1, weekday: 2 }, // ~1st Tuesday
  },
  // ── MEDIUM IMPACT ──
  {
    name: "ADP Non-Farm Employment Change",
    category: "EMPLOYMENT",
    importance: "MEDIUM",
    hour: 8,
    minute: 15,
    rule: { type: "nthWeekday", n: 1, weekday: 3 }, // 1st Wednesday (2 days before NFP)
  },
  {
    name: "Initial Jobless Claims",
    category: "EMPLOYMENT",
    importance: "MEDIUM",
    hour: 8,
    minute: 30,
    rule: { type: "weekly", weekday: 4 }, // every Thursday
  },
  {
    name: "Consumer Confidence",
    category: "CONSUMER",
    importance: "MEDIUM",
    hour: 10,
    minute: 0,
    rule: { type: "lastWeekday", weekday: 2 }, // last Tuesday
  },
  {
    name: "Michigan Consumer Sentiment",
    category: "CONSUMER",
    importance: "MEDIUM",
    hour: 10,
    minute: 0,
    rule: { type: "nthWeekday", n: 2, weekday: 5 }, // preliminary: 2nd Friday
  },
  {
    name: "Existing Home Sales",
    category: "HOUSING",
    importance: "MEDIUM",
    hour: 10,
    minute: 0,
    rule: { type: "dayOfMonth", day: 21 },
  },
  {
    name: "New Home Sales",
    category: "HOUSING",
    importance: "MEDIUM",
    hour: 10,
    minute: 0,
    rule: { type: "dayOfMonth", day: 25 },
  },
  {
    name: "Durable Goods Orders m/m",
    category: "MANUFACTURING",
    importance: "MEDIUM",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 27 },
  },
  {
    name: "Housing Starts",
    category: "HOUSING",
    importance: "MEDIUM",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 17 },
  },
  {
    name: "Building Permits",
    category: "HOUSING",
    importance: "MEDIUM",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 17 },
  },
  {
    name: "Trade Balance",
    category: "TRADE",
    importance: "MEDIUM",
    hour: 8,
    minute: 30,
    rule: { type: "dayOfMonth", day: 5 },
  },
  {
    name: "Industrial Production m/m",
    category: "MANUFACTURING",
    importance: "MEDIUM",
    hour: 9,
    minute: 15,
    rule: { type: "dayOfMonth", day: 16 },
  },
];

// Helper: get the nth occurrence of a weekday in a month
function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = startOfMonth(new Date(year, month));
  const firstDay = getDay(first);
  let offset = weekday - firstDay;
  if (offset < 0) offset += 7;
  return addDays(first, offset + (n - 1) * 7);
}

// Helper: get the last occurrence of a weekday in a month
function getLastWeekday(year: number, month: number, weekday: number): Date {
  const nextMonth = startOfMonth(addMonths(new Date(year, month), 1));
  let d = addDays(nextMonth, -1); // last day of month
  while (getDay(d) !== weekday) {
    d = addDays(d, -1);
  }
  return d;
}

// Helper: get a specific day of month, adjusted to nearest weekday
function getDayOfMonth(year: number, month: number, day: number): Date {
  const lastDay = addDays(startOfMonth(addMonths(new Date(year, month), 1)), -1).getDate();
  const actualDay = Math.min(day, lastDay);
  let d = new Date(year, month, actualDay);
  const dow = getDay(d);
  if (dow === 0) d = addDays(d, 1); // Sunday → Monday
  if (dow === 6) d = addDays(d, -1); // Saturday → Friday
  return d;
}

function resolveDate(
  rule: DateRule,
  year: number,
  month: number,
  weekInMonth?: number
): Date | null {
  switch (rule.type) {
    case "nthWeekday":
      return getNthWeekday(year, month, rule.weekday, rule.n);
    case "lastWeekday":
      return getLastWeekday(year, month, rule.weekday);
    case "dayOfMonth":
      return getDayOfMonth(year, month, rule.day);
    case "weekly":
      // Returns the occurrence within the given week (weekInMonth param used externally)
      return null; // handled separately
  }
}

export function generateForwardCalendar(
  weeksAhead: number = 8
): ScrapedEvent[] {
  const now = new Date();
  const cutoffStart = startOfWeek(addDays(now, 7), { weekStartsOn: 1 }); // start of next week
  const cutoffEnd = endOfWeek(addDays(now, weeksAhead * 7), { weekStartsOn: 1 });
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  // Generate for each month that overlaps our range
  const startMonth = new Date(cutoffStart.getFullYear(), cutoffStart.getMonth());
  const endMonth = addMonths(new Date(cutoffEnd.getFullYear(), cutoffEnd.getMonth()), 1);

  let current = startMonth;
  while (isBefore(current, endMonth)) {
    const year = current.getFullYear();
    const month = current.getMonth();

    for (const evt of KNOWN_SCHEDULE) {
      if (evt.rule.type === "weekly") {
        // Generate for each week in the range
        let weekStart = startOfWeek(
          new Date(year, month, 1),
          { weekStartsOn: 1 }
        );
        for (let w = 0; w < 6; w++) {
          let d = addDays(weekStart, evt.rule.weekday - 1); // weekday: 1=Mon...5=Fri
          // Adjust: date-fns weekday 4=Thu, but our rule uses 4=Thu too (0=Sun convention)
          d = addDays(weekStart, ((evt.rule.weekday - 1 + 7) % 7));
          if (getDay(d) !== evt.rule.weekday) {
            // recalculate
            const off = (evt.rule.weekday - getDay(weekStart) + 7) % 7;
            d = addDays(weekStart, off);
          }
          d = setHours(setMinutes(d, evt.minute), evt.hour + 5); // ET → UTC (+5)
          if (isAfter(d, cutoffStart) && isBefore(d, cutoffEnd)) {
            const key = `${evt.name}|${d.toISOString().slice(0, 10)}`;
            if (!seen.has(key)) {
              seen.add(key);
              events.push({
                eventName: evt.name,
                eventSlug: slugify(evt.name),
                dateTime: d,
                importance: evt.importance,
                category: evt.category,
                sourceUrl: "https://www.forexfactory.com/calendar",
              });
            }
          }
          weekStart = addDays(weekStart, 7);
        }
        continue;
      }

      const d = resolveDate(evt.rule, year, month);
      if (!d) continue;

      const withTime = setHours(setMinutes(d, evt.minute), evt.hour + 5); // ET → UTC (+5)

      if (isAfter(withTime, cutoffStart) && isBefore(withTime, cutoffEnd)) {
        const key = `${evt.name}|${withTime.toISOString().slice(0, 10)}`;
        if (!seen.has(key)) {
          seen.add(key);
          events.push({
            eventName: evt.name,
            eventSlug: slugify(evt.name),
            dateTime: withTime,
            importance: evt.importance,
            category: evt.category,
            sourceUrl: "https://www.forexfactory.com/calendar",
          });
        }
      }
    }

    current = addMonths(current, 1);
  }

  return events;
}

// ── Main scrape function ────────────────────────────────────────────

export async function scrapeEconomicCalendar(): Promise<ScrapedEvent[]> {
  const allEvents: ScrapedEvent[] = [];

  // 1. Fetch current week from Forex Factory (real data with forecasts)
  try {
    const ffEvents = await scrapeFromForexFactory();
    if (ffEvents.length > 0) {
      console.log(`Scraped ${ffEvents.length} USD events from Forex Factory`);
      allEvents.push(...ffEvents);
    }
  } catch (err) {
    console.error("Forex Factory scrape failed:", err);
  }

  // 2. Generate forward calendar for future weeks (known schedule)
  try {
    const forwardEvents = generateForwardCalendar(8);
    console.log(
      `Generated ${forwardEvents.length} forward calendar events (next 8 weeks)`
    );
    allEvents.push(...forwardEvents);
  } catch (err) {
    console.error("Forward calendar generation failed:", err);
  }

  return allEvents;
}
