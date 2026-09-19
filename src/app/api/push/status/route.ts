import { loadSubscriptions } from "@/lib/push-store";

export async function GET() {
  const subs = await loadSubscriptions();
  return Response.json({ count: subs.length });
}
