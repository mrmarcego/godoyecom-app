"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { createAdminAccount, type ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Input, Label, FormRow, FieldError, Card, CardBody } from "@/components/ui";
import { LogoWordmark } from "@/components/Logo";

const initialState: ActionState = {};

export default function AdminSignupPage() {
  const [state, formAction] = useFormState(createAdminAccount, initialState);

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
              Crear cuenta de administrador
            </h1>
            <p className="text-sm text-ink-secondary mb-5">
              Necesitas el código de administrador del equipo de Godoyecom.
            </p>
            <form action={formAction}>
              <FormRow>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" name="fullName" required />
              </FormRow>
              <FormRow>
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" required />
              </FormRow>
              <FormRow>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="code">Código de administrador</Label>
                <Input id="code" name="code" type="password" required />
              </FormRow>
              <FieldError>{state.error}</FieldError>
              <SubmitButton className="w-full mt-2">Crear cuenta</SubmitButton>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-sm text-[#c3c2b7] mt-6">
          <Link href="/login" className="text-brand-green font-medium">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
