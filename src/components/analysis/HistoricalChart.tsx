"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface HistoricalChartProps {
  events: {
    dateTime: string;
    actual?: string | null;
    forecast?: string | null;
    previous?: string | null;
  }[];
}

export function HistoricalChart({ events }: HistoricalChartProps) {
  const data = events
    .filter((e) => e.actual || e.forecast)
    .map((e) => ({
      date: format(new Date(e.dateTime), "MMM yy"),
      actual: e.actual ? parseFloat(e.actual.replace(/[^0-9.-]/g, "")) : null,
      forecast: e.forecast
        ? parseFloat(e.forecast.replace(/[^0-9.-]/g, ""))
        : null,
      previous: e.previous
        ? parseFloat(e.previous.replace(/[^0-9.-]/g, ""))
        : null,
    }))
    .filter((d) => d.actual !== null || d.forecast !== null)
    .sort(
      (a, b) =>
        events.findIndex(
          (e) => format(new Date(e.dateTime), "MMM yy") === a.date
        ) -
        events.findIndex(
          (e) => format(new Date(e.dateTime), "MMM yy") === b.date
        )
    );

  if (data.length < 2) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">
        Not enough data points for chart visualization.
      </p>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#f9fafb" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 3 }}
            name="Actual"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#3b82f6", r: 3 }}
            name="Forecast"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
