import { GuideHome } from "@/components/guide/GuideHome";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "/",
  "Sahada bugün",
  "Adana Open WTA 125: maç programı, bilet satışı ve saha bilgileri.",
);

export default function Page() {
  return <GuideHome />;
}
