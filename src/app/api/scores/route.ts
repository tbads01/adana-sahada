import { NextResponse } from "next/server";
import { getWtaBoard } from "@/lib/wta-scores";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getWtaBoard();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ updatedAt: null, matches: [], days: [], draw: [] });
  }
}
