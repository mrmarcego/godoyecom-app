"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Users, Instagram, ShoppingBag, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoWordmark } from "@/components/Logo";
import { Avatar } from "@/components/ui";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

// Los Server Components (los layout.tsx de /admin y /dashboard) no pueden
// pasar un componente de ícono como valor: eso es una función/referencia y
// rompe el límite Server -> Client. Por eso solo mandan el nombre (string) y
// este archivo, que ya es "use client", lo resuelve al componente real aquí.
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Instagram,
  ShoppingBag,
  MessageSquare,
};
export type IconKey = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function Shell({
  navItems,
  userName,
  roleLabel,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-surface-page">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-brand-black shrink-0">
        <div className="h-16 flex items-center px-6">
          <Link href="/">
            <LogoWordmark className="text-xl" />
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-green text-brand-black"
                    : "text-[#c3c2b7] hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={userName} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-[#898781]">{roleLabel}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-1 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#c3c2b7] hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 bg-brand-black shrink-0 sticky top-0 z-20">
          <Link href="/">
            <LogoWordmark className="text-lg" />
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-[#c3c2b7] p-1"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </form>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-brand-black border-t border-white/10 flex items-stretch z-20">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px]",
                  active ? "text-brand-green" : "text-[#898781]"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
