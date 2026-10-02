import { isAdmin } from "@/lib/auth";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const authed = await isAdmin();
  return authed ? <AdminDashboard /> : <AdminLogin />;
}
