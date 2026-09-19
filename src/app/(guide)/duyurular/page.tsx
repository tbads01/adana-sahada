import { GuideNews } from "@/components/guide/GuideNews";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/duyurular", "Duyurular", "Adana Open duyuruları.");

export default function Page() {
  return <GuideNews />;
}
