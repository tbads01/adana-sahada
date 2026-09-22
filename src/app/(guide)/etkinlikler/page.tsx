import { GuideEvents } from "@/components/guide/GuideEvents";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("/etkinlikler", "Etkinlikler", "Adana Open yan etkinlikleri ve günlük saha programı.");

export default function Page() {
  return <GuideEvents />;
}
