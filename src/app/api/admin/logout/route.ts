import { NextResponse } from "next/server";
import { adminCookieOptions, adminPageUrl } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const res = NextResponse.redirect(adminPageUrl(request), 303);
  res.cookies.set("ao_admin", "", { ...adminCookieOptions(), maxAge: 0 });
  return res;
}
