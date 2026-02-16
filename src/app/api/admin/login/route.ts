import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword, sessionCookieOptions } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password !== getAdminPassword()) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
