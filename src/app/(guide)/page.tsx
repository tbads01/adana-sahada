import { GuideHome } from "@/components/guide/GuideHome";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "/",
  "Sahada bugün",
  "Adana Open: maçlar, bilet, saha bilgisi.",
);

export default function Page() {
  return <GuideHome />;
}
