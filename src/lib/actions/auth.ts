"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const adminSignupSchema = z.object({
  fullName: z.string().min(2, "Ingresa tu nombre completo."),
  email: z.string().email("Correo inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  code: z.string().min(1, "Ingresa el código de administrador."),
});

export interface ActionState {
  error?: string;
  success?: boolean;
}

/**
 * Crea una cuenta de administrador. El código secreto (ADMIN_SIGNUP_CODE) se
 * valida SOLO en el servidor y la promoción a rol "admin" se hace con la
 * service role key, así que nunca depende de datos que mande el navegador.
 */
export async function createAdminAccount(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = adminSignupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { fullName, email, password, code } = parsed.data;

  if (!process.env.ADMIN_SIGNUP_CODE || code !== process.env.ADMIN_SIGNUP_CODE) {
    return { error: "Código de administrador incorrecto." };
  }

  const admin = createServiceRoleClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created?.user) {
    return {
      error:
        createError?.message === "User already registered"
          ? "Ya existe una cuenta con ese correo."
          : createError?.message ?? "No se pudo crear la cuenta.",
    };
  }

  const { error: promoteError } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", created.user.id);

  if (promoteError) {
    return {
      error:
        "La cuenta se creó pero no se pudo asignar el rol de administrador. Avisa a soporte.",
    };
  }

  redirect("/login?admin_created=1");
}
