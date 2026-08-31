import { redirect } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Shell, type NavItem } from "@/components/Shell";

export const dynamic = "force-dynamic";

const navItems: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/students", label: "Estudiantes", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <Shell
      navItems={navItems}
      userName={profile?.full_name || "Administrador"}
      roleLabel="Administrador"
    >
      {children}
    </Shell>
  );
}
