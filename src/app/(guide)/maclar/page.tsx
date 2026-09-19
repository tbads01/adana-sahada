import { GuideMatches } from "@/components/guide/GuideMatches";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/maclar", "Maç panosu", "Adana Open canlı skor ve kort programı.");

export default function Page() {
  return <GuideMatches />;
}
