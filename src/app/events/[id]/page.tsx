import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { EventDetailClient } from "./EventDetailClient";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.economicEvent.findUnique({
    where: { id },
    include: { analysis: true },
  });

  if (!event) notFound();

  // Serialize dates for client component
  const serialized = {
    ...event,
    dateTime: event.dateTime.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    analysis: event.analysis
      ? {
          ...event.analysis,
          createdAt: event.analysis.createdAt.toISOString(),
          updatedAt: event.analysis.updatedAt.toISOString(),
        }
      : null,
  };

  return <EventDetailClient event={serialized} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.economicEvent.findUnique({ where: { id } });
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.eventName} | Trading News`,
    description: `AI analysis of ${event.eventName} - ${format(event.dateTime, "MMM d, yyyy")}`,
  };
}
