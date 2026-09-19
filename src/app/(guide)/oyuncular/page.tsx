import { GuidePlayers } from "@/components/guide/GuidePlayers";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/oyuncular", "Oyuncular", "Adana Open ana tablo oyuncuları.");

export default function Page() {
  return <GuidePlayers />;
}
