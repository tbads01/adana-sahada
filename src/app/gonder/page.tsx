import type { Metadata } from "next";
import { GuideSend } from "@/components/guide/GuideSend";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = {
  ...pageMeta("/gonder", "Bildirim gönder", "Adana Open bildirim gönderimi."),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <GuideSend />;
}
