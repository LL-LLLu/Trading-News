import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);

  const evaluations = await prisma.stockEvaluation.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(evaluations);
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ticker, title, content, coverImage, published } = body;

    if (!ticker || !title || !content) {
      return NextResponse.json(
        { error: "ticker, title, and content are required" },
        { status: 400 }
      );
    }

    let slug = slugify(title);

    // Ensure unique slug
    const existing = await prisma.stockEvaluation.findUnique({
      where: { slug },
    });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const evaluation = await prisma.stockEvaluation.create({
      data: {
        ticker: ticker.toUpperCase(),
        title,
        slug,
        content,
        coverImage: coverImage || null,
        published: published ?? false,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create evaluation" },
      { status: 500 }
    );
  }
}
