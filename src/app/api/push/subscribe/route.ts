import { saveSubscription } from "@/lib/push-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { endpoint?: string; keys?: { p256dh: string; auth: string } };
  if (!body?.endpoint) {
    return Response.json({ ok: false }, { status: 400 });
  }
  try {
    const count = await saveSubscription({ endpoint: body.endpoint, keys: body.keys });
    return Response.json({ ok: true, count });
  } catch {
    return Response.json({ ok: false, error: "store" }, { status: 500 });
  }
}
