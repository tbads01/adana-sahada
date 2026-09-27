import { NextResponse } from "next/server";
import { getSharedFacts } from "@/lib/facts";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(getSharedFacts(), {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
