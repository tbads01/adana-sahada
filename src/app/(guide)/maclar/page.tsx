import { GuideMatches } from "@/components/guide/GuideMatches";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/maclar", "Maç panosu", "Adana Open kort programı ve skorlar.");

export default function Page() {
  return <GuideMatches />;
}
