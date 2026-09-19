import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { persistFile } from "./persist";

export type StoredSub = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
  addedAt?: number;
};

function storeFile() {
  return persistFile("push-subscriptions.json");
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
  const existing = all.find((item) => item.endpoint === sub.endpoint);
  const next = all
    .filter((item) => item.endpoint !== sub.endpoint)
    .concat({ ...sub, addedAt: existing?.addedAt ?? Date.now() });
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
