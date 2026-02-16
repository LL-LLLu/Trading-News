import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const evaluation = await prisma.stockEvaluation.findUnique({
    where: { id },
  });

  if (!evaluation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(evaluation);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isAdminAuthenticated(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { ticker, title, content, coverImage, published } = body;

    const data: Record<string, unknown> = {};
    if (ticker !== undefined) data.ticker = ticker.toUpperCase();
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (published !== undefined) data.published = published;

    const evaluation = await prisma.stockEvaluation.update({
      where: { id },
      data,
    });

    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json(
      { error: "Failed to update evaluation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isAdminAuthenticated(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.stockEvaluation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete evaluation" },
      { status: 500 }
    );
  }
}
