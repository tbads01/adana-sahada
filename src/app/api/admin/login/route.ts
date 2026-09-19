import { NextResponse } from "next/server";
import { adminCookieOptions, adminPageUrl, adminSecret, signAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function readPassword(request: Request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    return { password: body.password || "", json: true };
  }
  const form = await request.formData().catch(() => null);
  return { password: String(form?.get("password") || ""), json: false };
}

export async function POST(request: Request) {
  const secret = adminSecret();
  if (!secret) {
    if ((request.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
    }
    return NextResponse.redirect(adminPageUrl(request, "?err=setup"), 303);
  }

  const { password, json } = await readPassword(request);
  if (password !== secret) {
    if (json) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
    return NextResponse.redirect(adminPageUrl(request, "?err=auth"), 303);
  }

  const res = json ? NextResponse.json({ ok: true }) : NextResponse.redirect(adminPageUrl(request), 303);
  res.cookies.set("ao_admin", signAdminToken(), adminCookieOptions());
  return res;
}
