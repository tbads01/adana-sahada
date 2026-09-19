import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredSub = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
};

function storeFile() {
  if (process.env.PUSH_STORE_PATH) return process.env.PUSH_STORE_PATH;
  // Hostinger Node.js cwd: ~/domains/{domain}/hbuilds/current/nodejs
  // Keep subscriptions outside versioned builds so they survive redeploys.
  if (process.cwd().includes(`${path.sep}hbuilds${path.sep}`)) {
    return path.resolve(process.cwd(), "../../../persist/push-subscriptions.json");
  }
  return path.join(process.cwd(), "data", "push-subscriptions.json");
}

export async function loadSubscriptions(): Promise<StoredSub[]> {
  try {
    const raw = await readFile(storeFile(), "utf8");
    const parsed = JSON.parse(raw) as StoredSub[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSubscription(sub: StoredSub) {
  const file = storeFile();
  const all = await loadSubscriptions();
  const next = all.filter((item) => item.endpoint !== sub.endpoint).concat(sub);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(next, null, 2));
  return next.length;
}

export async function removeSubscription(endpoint: string) {
  const file = storeFile();
  const all = await loadSubscriptions();
  const next = all.filter((item) => item.endpoint !== endpoint);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(next, null, 2));
  return next.length;
}
