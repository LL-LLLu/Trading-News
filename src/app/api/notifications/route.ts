import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const since = searchParams.get("since");
  const limit = parseInt(searchParams.get("limit") || "50");

  const notifications = await prisma.notification.findMany({
    where: since
      ? { createdAt: { gt: new Date(since) } }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(notifications);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const before = searchParams.get("before");

  if (before) {
    await prisma.notification.deleteMany({
      where: { createdAt: { lt: new Date(before) } },
    });
  }

  return NextResponse.json({ success: true });
}
