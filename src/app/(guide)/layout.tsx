import type { ReactNode } from "react";
import { GuideShell } from "@/components/guide/GuideShell";
import { VisitTracker } from "@/components/VisitTracker";

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <VisitTracker />
      <GuideShell>{children}</GuideShell>
    </>
  );
}
