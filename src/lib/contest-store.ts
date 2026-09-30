import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
} from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { adminSecret } from "./admin-auth";
import {
  type ContestConsents,
  type ContestEntryPublic,
  type ContestGuesses,
  type ContestLegalDoc,
  contestOpen,
  istanbulStamp,
  normalizeTrMobile,
} from "./contest";
import { DEFAULT_LEGAL } from "./contest-legal";
import { persistFile } from "./persist";

type EncBlob = { iv: string; tag: string; data: string };

type StoredEntry = {
  id: string;
  phoneHash: string;
  enc: EncBlob;
  guesses: ContestGuesses;
  consents: ContestConsents;
  createdAt: string;
  createdAtMs: number;
};

type StoreFile = { entries: StoredEntry[] };

type Pii = { firstName: string; lastName: string; phone: string };

let queue: Promise<unknown> = Promise.resolve();

function runExclusive<T>(work: () => Promise<T>) {
  const next = queue.then(work, work);
  queue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function entriesFile() {
  return persistFile("contest-entries.json");
}

function legalFile() {
  return persistFile("contest-legal.json");
}

function keyMaterial() {
  return scryptSync(adminSecret(), "adana-open-contest-v1", 32);
}

function hmacKey() {
  return scryptSync(adminSecret(), "adana-open-contest-phone", 32);
}

export function phoneHash(phoneE164: string) {
  return createHmac("sha256", hmacKey()).update(phoneE164).digest("hex");
}

function encryptPii(pii: Pii): EncBlob {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyMaterial(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(pii), "utf8"), cipher.final()]);
  return {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
}

function decryptPii(blob: EncBlob): Pii | null {
  try {
    const decipher = createDecipheriv("aes-256-gcm", keyMaterial(), Buffer.from(blob.iv, "base64"));
    decipher.setAuthTag(Buffer.from(blob.tag, "base64"));
    const raw = Buffer.concat([decipher.update(Buffer.from(blob.data, "base64")), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(raw) as Pii;
    if (!parsed.firstName || !parsed.phone) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(entriesFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

async function writeStore(store: StoreFile) {
  const file = entriesFile();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(store, null, 2));
}

export async function loadLegal(): Promise<ContestLegalDoc> {
  try {
    const raw = await readFile(legalFile(), "utf8");
    const parsed = JSON.parse(raw) as ContestLegalDoc;
    if (!parsed?.version || !parsed.kvkk?.tr) return DEFAULT_LEGAL;
    return {
      version: String(parsed.version),
      updatedAt: parsed.updatedAt || DEFAULT_LEGAL.updatedAt,
      kvkk: { tr: parsed.kvkk.tr || DEFAULT_LEGAL.kvkk.tr, en: parsed.kvkk.en || DEFAULT_LEGAL.kvkk.en },
      riza: { tr: parsed.riza?.tr || DEFAULT_LEGAL.riza.tr, en: parsed.riza?.en || DEFAULT_LEGAL.riza.en },
      rules: { tr: parsed.rules?.tr || DEFAULT_LEGAL.rules.tr, en: parsed.rules?.en || DEFAULT_LEGAL.rules.en },
      draw: { tr: parsed.draw?.tr || DEFAULT_LEGAL.draw.tr, en: parsed.draw?.en || DEFAULT_LEGAL.draw.en },
      marketing: {
        tr: parsed.marketing?.tr || DEFAULT_LEGAL.marketing.tr,
        en: parsed.marketing?.en || DEFAULT_LEGAL.marketing.en,
      },
      retention: {
        tr: parsed.retention?.tr || DEFAULT_LEGAL.retention.tr,
        en: parsed.retention?.en || DEFAULT_LEGAL.retention.en,
      },
    };
  } catch {
    return DEFAULT_LEGAL;
  }
}

export async function saveLegal(next: ContestLegalDoc) {
  const file = legalFile();
  await mkdir(path.dirname(file), { recursive: true });
  const doc: ContestLegalDoc = {
    version: next.version.trim() || istanbulStamp(),
    updatedAt: istanbulStamp(),
    kvkk: { tr: next.kvkk.tr.trim(), en: next.kvkk.en.trim() },
    riza: { tr: next.riza.tr.trim(), en: next.riza.en.trim() },
    rules: { tr: next.rules.tr.trim(), en: next.rules.en.trim() },
    draw: { tr: next.draw.tr.trim(), en: next.draw.en.trim() },
    marketing: {
      tr: (next.marketing?.tr || DEFAULT_LEGAL.marketing.tr).trim(),
      en: (next.marketing?.en || DEFAULT_LEGAL.marketing.en).trim(),
    },
    retention: {
      tr: (next.retention?.tr || DEFAULT_LEGAL.retention.tr).trim(),
      en: (next.retention?.en || DEFAULT_LEGAL.retention.en).trim(),
    },
  };
  await writeFile(file, JSON.stringify(doc, null, 2));
  return doc;
}

function toPublic(row: StoredEntry): ContestEntryPublic {
  const pii = decryptPii(row.enc);
  return {
    id: row.id,
    firstName: pii?.firstName || "—",
    lastName: pii?.lastName || "—",
    phone: pii?.phone || "—",
    guesses: row.guesses,
    consents: row.consents,
    createdAt: row.createdAt,
    marketing: Boolean(row.consents.marketing),
  };
}

export async function listEntries() {
  const store = await readStore();
  return store.entries
    .slice()
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .map(toPublic);
}

export type SaveContestInput = {
  firstName: string;
  lastName: string;
  phone: string;
  guesses: ContestGuesses;
  marketing: boolean;
};

export async function saveEntry(input: SaveContestInput) {
  return runExclusive(async () => {
    if (!contestOpen()) return { ok: false as const, error: "closed" };
    const phone = normalizeTrMobile(input.phone);
    if (!phone) return { ok: false as const, error: "phone" };
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    if (firstName.length < 2 || lastName.length < 2) return { ok: false as const, error: "name" };
    const legal = await loadLegal();
    const store = await readStore();
    const hash = phoneHash(phone);
    if (store.entries.some((row) => row.phoneHash === hash)) return { ok: false as const, error: "duplicate" };
    const at = istanbulStamp();
    const stamp = (body: string) => ({
      at,
      version: legal.version,
      hash: createHash("sha256").update(body).digest("hex").slice(0, 16),
    });
    const row: StoredEntry = {
      id: randomUUID(),
      phoneHash: hash,
      enc: encryptPii({ firstName, lastName, phone }),
      guesses: input.guesses,
      consents: {
        kvkk: stamp(legal.kvkk.tr),
        riza: stamp(legal.riza.tr),
        rules: stamp(`${legal.rules.tr}\n${legal.draw.tr}`),
        marketing: input.marketing ? stamp(legal.marketing.tr) : null,
      },
      createdAt: `${at}+03:00`,
      createdAtMs: Date.now(),
    };
    store.entries.push(row);
    await writeStore(store);
    return { ok: true as const, id: row.id };
  });
}

export async function contestCount() {
  const store = await readStore();
  return store.entries.length;
}
