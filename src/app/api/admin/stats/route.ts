import { isAdminRequest } from "@/lib/admin-auth";
import { buildAdminDashboard } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ ok: false, error: "auth" }, { status: 401 });
  }
  const data = await buildAdminDashboard();
  return Response.json({ ok: true, data });
}
