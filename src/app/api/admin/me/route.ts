import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authenticated = await isAdminAuthenticated(request);
  return NextResponse.json({ authenticated });
}
