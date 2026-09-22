export function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

export function when(ts: number | null) {
  if (!ts) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts);
}

export function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function ago(ts: number, now: number) {
  const sec = Math.max(0, Math.round((now - ts) / 1000));
  if (sec < 10) return "şimdi";
  if (sec < 60) return `${sec} sn`;
  return `${Math.floor(sec / 60)} dk`;
}

export function delta(current: number, previous: number) {
  if (!previous) return current ? "Önceki döneme göre yeni" : "Önceki dönemle aynı";
  const diff = current - previous;
  if (diff === 0) return "Önceki dönemle aynı";
  const n = Math.round((diff / previous) * 100);
  if (previous < 5 || Math.abs(n) >= 250) {
    return diff > 0 ? `Önceki döneme göre +${fmt(diff)}` : `Önceki döneme göre ${fmt(diff)}`;
  }
  return n > 0 ? `Önceki döneme göre +${n}%` : `Önceki döneme göre ${n}%`;
}

export function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-3xl border border-white/10 bg-panel p-4 md:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-3">
      <p className="text-[0.68rem] font-bold tracking-[0.12em] text-paper/45 uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em]">{value}</p>
      {hint ? <p className="mt-0.5 text-[0.72rem] text-paper/45">{hint}</p> : null}
    </div>
  );
}

export function Bar({ value, max, label, suffix, tone = "yellow" }: { value: number; max: number; label: string; suffix?: string; tone?: "yellow" | "green" }) {
  const width = max ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="w-28 shrink-0 truncate text-[0.78rem] font-bold md:w-40">{label}</p>
      <div className="h-2 min-w-0 flex-1 rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${tone === "green" ? "bg-green" : "bg-yellow"}`} style={{ width: `${width}%` }} />
      </div>
      <p className="w-16 shrink-0 text-right text-[0.78rem] font-bold text-paper/70">
        {fmt(value)}
        {suffix ?? ""}
      </p>
    </div>
  );
}
