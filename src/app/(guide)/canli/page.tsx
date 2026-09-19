import { GuideLive } from "@/components/guide/GuideLive";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/canli", "Canlı yayın", "Adana Open canlı yayın ve skor.");

export default function Page() {
  return <GuideLive />;
}
