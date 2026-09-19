import { GuideHome } from "@/components/guide/GuideHome";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "/",
  "Sahada bugün",
  "Adana Open saha uygulaması: maç takibi, etkinlikler, duyurular, canlı yayın ve saha bilgisi.",
);

export default function Page() {
  return <GuideHome />;
}
