import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieOptions(true));
  return response;
}
