import webpush from "web-push";
import { loadSubscriptions, removeSubscription } from "@/lib/push-store";
import { VAPID_PUBLIC_KEY } from "@/lib/push";
import { ROUTES } from "@/lib/routes";

export async function POST(request: Request) {
  const secret = process.env.PUSH_ADMIN_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  const body = (await request.json()) as {
    password?: string;
    title?: string;
    message?: string;
    url?: string;
  };

  if (body.password !== secret) {
    return Response.json({ ok: false, error: "auth" }, { status: 401 });
  }

  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) {
    return Response.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:info@adanaopen.com", VAPID_PUBLIC_KEY, privateKey);

  const title = (body.title || "Adana Open").trim();
  const message = (body.message || "").trim();
  const url = body.url || ROUTES.home;
  const payload = JSON.stringify({ title, body: message, url });

  const subs = await loadSubscriptions();
  let sent = 0;
  for (const sub of subs) {
    if (!sub.keys?.p256dh || !sub.keys.auth) continue;
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        payload,
      );
      sent += 1;
    } catch (error) {
      const status = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
      if (status === 404 || status === 410) {
        await removeSubscription(sub.endpoint);
      }
    }
  }

  return Response.json({ ok: true, sent, total: subs.length });
}
