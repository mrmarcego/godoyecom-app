"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Input,
  Label,
  FormRow,
  FieldError,
  Card,
  CardBody,
  EmptyState,
} from "@/components/ui";
import { LogoWordmark } from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });
    setLoading(false);

    if (error) {
      setError(
        error.message === "User already registered"
          ? "Ya existe una cuenta con ese correo. Intenta iniciar sesión."
          : error.message
      );
      return;
    }

    if (data.session) {
      router.refresh();
      router.push("/dashboard");
      return;
    }

    setSubmitted(true);
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
            {submitted ? (
              <EmptyState
                icon={<Mail size={28} />}
                title="Revisa tu correo"
                description="Te enviamos un enlace para confirmar tu cuenta. Después de confirmarla, ya puedes iniciar sesión."
                action={
                  <Link href="/login">
                    <Button variant="secondary">Ir a iniciar sesión</Button>
                  </Link>
                }
              />
            ) : (
              <>
                <h1 className="text-lg font-semibold text-ink-primary mb-1">
                  Crea tu cuenta de estudiante
                </h1>
                <p className="text-sm text-ink-secondary mb-5">
                  Solo tú vas a poder ver tus datos.
                </p>
                <form onSubmit={handleSubmit}>
                  <FormRow>
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                      id="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                    />
                  </FormRow>
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
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </FormRow>
                  <FieldError>{error}</FieldError>
                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </form>
              </>
            )}
          </CardBody>
        </Card>

        {!submitted && (
          <p className="text-center text-sm text-[#c3c2b7] mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-brand-green font-medium">
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
