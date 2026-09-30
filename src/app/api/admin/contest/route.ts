import { isAdminRequest } from "@/lib/admin-auth";
import { displayTrMobile, istanbulStamp, type ContestLegalDoc } from "@/lib/contest";
import { listEntries, loadLegal, saveLegal } from "@/lib/contest-store";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | boolean) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ ok: false, error: "auth" }, { status: 401 });
  }
  const url = new URL(request.url);
  const legal = await loadLegal();
  const entries = await listEntries();

  if (url.searchParams.get("format") === "csv") {
    const header = [
      "Ad",
      "Soyad",
      "Telefon",
      "Ace",
      "Toplam dakika",
      "Final dakika",
      "KVKK",
      "Acik riza",
      "Kosullar",
      "Ticari ileti",
      "Katilim (TR)",
      "Metin surumu",
    ];
    const rows = entries.map((row) =>
      [
        row.firstName,
        row.lastName,
        displayTrMobile(row.phone),
        row.guesses.aces,
        row.guesses.totalMinutes,
        row.guesses.finalMinutes,
        row.consents.kvkk.at,
        row.consents.riza.at,
        row.consents.rules.at,
        row.consents.marketing?.at || "",
        row.createdAt,
        row.consents.kvkk.version,
      ]
        .map(csvCell)
        .join(","),
    );
    const bom = "\uFEFF";
    return new Response(bom + [header.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="adana-open-tahmin-${istanbulStamp().slice(0, 10)}.csv"`,
      },
    });
  }

  return Response.json({ ok: true, count: entries.length, legal, entries });
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ ok: false, error: "auth" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { legal?: ContestLegalDoc } | null;
  if (!body?.legal) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const legal = await saveLegal(body.legal);
  return Response.json({ ok: true, legal });
}
