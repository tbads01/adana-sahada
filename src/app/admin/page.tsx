import { cookies } from "next/headers";
import { AdminLogin, AdminPanel } from "@/components/admin/AdminPanel";
import { verifyAdminToken } from "@/lib/admin-auth";
import { buildAdminDashboard } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Yönetim",
  description: "Adana Open saha istatistikleri ve bildirim paneli.",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const token = (await cookies()).get("ao_admin")?.value;
  if (!verifyAdminToken(token)) {
    const err = (await searchParams).err;
    return (
      <AdminLogin
        devHint={process.env.NODE_ENV !== "production"}
        error={err === "auth" ? "Şifre yanlış." : err === "setup" ? "Sunucuda yönetici şifresi tanımlı değil." : ""}
      />
    );
  }

  const data = await buildAdminDashboard();
  return <AdminPanel data={data} />;
}
