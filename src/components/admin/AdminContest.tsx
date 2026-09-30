"use client";

import { useCallback, useEffect, useState } from "react";
import { displayTrMobile, istanbulStamp, type ContestEntryPublic, type ContestLegalDoc } from "@/lib/contest";
import { DEFAULT_LEGAL } from "@/lib/contest-legal";
import { Card } from "./admin-ui";

const emptyLegal = (): ContestLegalDoc => structuredClone(DEFAULT_LEGAL);

export function AdminContest() {
  const [entries, setEntries] = useState<ContestEntryPublic[]>([]);
  const [legal, setLegal] = useState<ContestLegalDoc>(emptyLegal);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/contest", { cache: "no-store" });
    const json = (await res.json()) as { ok?: boolean; count?: number; legal?: ContestLegalDoc; entries?: ContestEntryPublic[] };
    if (res.ok && json.ok) {
      setCount(json.count ?? json.entries?.length ?? 0);
      if (json.legal) setLegal(json.legal);
      setEntries(json.entries ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveLegal(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    const next: ContestLegalDoc = { ...legal, version: legal.version.trim() || istanbulStamp() };
    const res = await fetch("/api/admin/contest", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legal: next }),
    });
    const json = (await res.json()) as { ok?: boolean; legal?: ContestLegalDoc };
    setBusy(false);
    if (res.ok && json.ok && json.legal) {
      setLegal(json.legal);
      setStatus("Yasal metinler kaydedildi. Yeni katılımlar bu sürüme bağlanır.");
    } else {
      setStatus("Metinler kaydedilemedi.");
    }
  }

  const area = "mt-1 min-h-36 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-yellow";
  const input = "mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-yellow";

  return (
    <Card id="yarisma">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Tahmin yarışması</h2>
          <p className="mt-1 text-sm text-paper/50">{count} katılım · kişisel veriler şifreli saklanır</p>
        </div>
        <a
          href="/api/admin/contest?format=csv"
          className="rounded-full bg-yellow px-3 py-1.5 text-[0.72rem] font-bold text-ink"
        >
          CSV / Excel indir
        </a>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-[0.78rem]">
          <thead className="text-[0.65rem] font-bold tracking-[0.12em] text-paper/40 uppercase">
            <tr>
              <th className="pb-2 pr-3">Ad</th>
              <th className="pb-2 pr-3">Soyad</th>
              <th className="pb-2 pr-3">Telefon</th>
              <th className="pb-2 pr-3">Ace</th>
              <th className="pb-2 pr-3">Toplam dk</th>
              <th className="pb-2 pr-3">Final dk</th>
              <th className="pb-2 pr-3">Onaylar</th>
              <th className="pb-2">Katılım (TR)</th>
            </tr>
          </thead>
          <tbody>
            {entries.length ? (
              entries.map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="py-2 pr-3 font-bold">{row.firstName}</td>
                  <td className="py-2 pr-3">{row.lastName}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{displayTrMobile(row.phone)}</td>
                  <td className="py-2 pr-3">{row.guesses.aces}</td>
                  <td className="py-2 pr-3">{row.guesses.totalMinutes}</td>
                  <td className="py-2 pr-3">{row.guesses.finalMinutes}</td>
                  <td className="py-2 pr-3 text-paper/60">
                    KVKK {row.consents.kvkk.at.slice(11, 16)} · Rıza {row.consents.riza.at.slice(11, 16)} · Koşul{" "}
                    {row.consents.rules.at.slice(11, 16)}
                    {row.consents.marketing ? ` · SMS ${row.consents.marketing.at.slice(11, 16)}` : " · SMS yok"}
                    <span className="block text-[0.65rem] text-paper/40">v{row.consents.kvkk.version}</span>
                  </td>
                  <td className="py-2 whitespace-nowrap">{row.createdAt.replace("T", " ")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-3 text-paper/45">
                  Henüz katılım yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={(e) => void saveLegal(e)} className="mt-6 space-y-4">
        <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/40 uppercase">
          Yasal metinler (taslak — hukuk kontrolü)
        </p>
        <label className="block text-sm font-bold">
          Metin sürümü
          <input
            value={legal.version}
            onChange={(e) => setLegal({ ...legal, version: e.target.value })}
            className={input}
          />
        </label>
        {(
          [
            ["kvkk", "KVKK Aydınlatma Metni"],
            ["riza", "Açık Rıza Metni"],
            ["rules", "Katılım Koşulları"],
            ["draw", "Çekiliş Kuralları"],
            ["marketing", "Ticari ileti"],
            ["retention", "Veri saklama süresi"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-bold">
              {label} · TR
              <textarea
                value={legal[key].tr}
                onChange={(e) => setLegal({ ...legal, [key]: { ...legal[key], tr: e.target.value } })}
                className={area}
              />
            </label>
            <label className="block text-sm font-bold">
              {label} · EN
              <textarea
                value={legal[key].en}
                onChange={(e) => setLegal({ ...legal, [key]: { ...legal[key], en: e.target.value } })}
                className={area}
              />
            </label>
          </div>
        ))}
        <button type="submit" className="btn btn-primary !text-ink" disabled={busy}>
          Metinleri kaydet
        </button>
        {status ? <p className="text-sm font-bold text-yellow">{status}</p> : null}
      </form>
    </Card>
  );
}
