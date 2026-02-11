import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { OutlookClient } from "./OutlookClient";

export const dynamic = "force-dynamic";

export default async function OutlookPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const outlook = await prisma.weeklyOutlook.findUnique({
    where: { weekStart },
  });

  const serialized = outlook
    ? {
        ...outlook,
        weekStart: outlook.weekStart.toISOString(),
        weekEnd: outlook.weekEnd.toISOString(),
        createdAt: outlook.createdAt.toISOString(),
        updatedAt: outlook.updatedAt.toISOString(),
      }
    : null;

  return <OutlookClient outlook={serialized} />;
}

export const metadata = {
  title: "Weekly Outlook | Trading News",
  description: "AI-generated weekly market outlook and key economic themes",
};
