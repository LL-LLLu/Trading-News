import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";
const SESSION_VALUE = "authenticated";

export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD environment variable is not set");
  return pw;
}

export async function isAdminAuthenticated(
  request?: NextRequest
): Promise<boolean> {
  if (request) {
    return request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
  }
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export function sessionCookieOptions(clear = false) {
  return {
    name: SESSION_COOKIE,
    value: clear ? "" : SESSION_VALUE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: clear ? 0 : 60 * 60 * 24 * 7, // 7 days
  };
}
