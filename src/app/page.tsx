import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoWordmark } from "@/components/Logo";
import { Button } from "@/components/ui";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 text-center">
      <LogoWordmark className="text-4xl sm:text-5xl mb-4" />
      <p className="text-[#c3c2b7] max-w-md mb-8">
        La plataforma de Godoyecom para medir tu crecimiento en Instagram y las
        métricas de tu negocio de reventa, todo en un solo lugar.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login">
          <Button variant="primary" size="lg">
            Iniciar sesión
          </Button>
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-5 text-base text-white hover:bg-white/5 transition-colors"
        >
          Crear cuenta de estudiante
        </Link>
      </div>
    </main>
  );
}
