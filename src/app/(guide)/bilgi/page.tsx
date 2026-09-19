import { GuideInfo } from "@/components/guide/GuideInfo";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/bilgi", "Saha bilgisi", "Adana Open nasıl gelinir, otopark, bilet ve saha bilgisi.");

export default function Page() {
  return <GuideInfo />;
}
