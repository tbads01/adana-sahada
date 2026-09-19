import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="h-svh overflow-y-auto bg-void text-paper">{children}</div>;
}
