import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import AdminPanel from "./AdminPanel";

export const metadata = { title: "Admin – Naboverktøy" };

export default async function AdminPage() {
  const adminId = await requireAdmin();
  if (!adminId) redirect("/");

  const [users, tools] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        neighborhood: true,
        isAdmin: true,
        _count: { select: { tools: true, requests: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.tool.findMany({
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <AdminPanel adminId={adminId} initialUsers={users} initialTools={tools} />;
}
