"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, FormRow, FieldError, Card, CardBody } from "@/components/ui";
import { LogoWordmark } from "@/components/Logo";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminCreated = searchParams.get("admin_created");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-brand-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <LogoWordmark className="text-3xl" />
          </Link>
        </div>
        <Card>
          <CardBody>
            <h1 className="text-lg font-semibold text-ink-primary mb-1">
              Inicia sesión
            </h1>
            <p className="text-sm text-ink-secondary mb-5">
              Entra con tu correo y contraseña.
            </p>

            {adminCreated && (
              <div className="mb-4 rounded-lg bg-status-good/10 text-status-good text-sm px-3 py-2">
                Cuenta de administrador creada. Ya puedes iniciar sesión.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <FormRow>
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </FormRow>
              <FieldError>{error}</FieldError>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Entrando..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-sm text-[#c3c2b7] mt-6">
          ¿Eres estudiante y no tienes cuenta?{" "}
          <Link href="/signup" className="text-brand-green font-medium">
            Regístrate
          </Link>
        </p>
        <p className="text-center text-xs text-[#898781] mt-2">
          ¿Eres administrador?{" "}
          <Link href="/admin-signup" className="text-[#c3c2b7] underline">
            Crear cuenta de administrador
          </Link>
        </p>
      </div>
    </main>
  );
}
