import { GuideInfo } from "@/components/guide/GuideInfo";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/bilgi", "Saha bilgisi", "Adana Open ulaşım, otopark, bilet ve saha bilgileri.");

export default function Page() {
  return <GuideInfo />;
}
