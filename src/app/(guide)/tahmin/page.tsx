import { GuideContest } from "@/components/guide/GuideContest";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "/tahmin",
  "Adana Open Tahmin Yarışması",
  "Turnuvaya dair tahminlerini paylaş. Doğru veya en yakın tahminleri yapanlar arasındaki çekilişle toplam 20 kişiye sürpriz hediye verilecek. Ödüller değişkenlik gösterebilir.",
);

export default function Page() {
  return <GuideContest />;
}
