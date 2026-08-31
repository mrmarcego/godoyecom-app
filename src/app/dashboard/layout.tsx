import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell, type NavItem } from "@/components/Shell";

export const dynamic = "force-dynamic";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: "LayoutDashboard" },
  { href: "/dashboard/instagram", label: "Instagram", icon: "Instagram" },
  { href: "/dashboard/business", label: "Mi negocio", icon: "ShoppingBag" },
  { href: "/dashboard/feedback", label: "Feedback", icon: "MessageSquare" },
];

export default async function DashboardLayout({
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
      userName={profile?.full_name || "Estudiante"}
      roleLabel="Estudiante"
    >
      {children}
    </Shell>
  );
}
