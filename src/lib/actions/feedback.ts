"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/auth";

const feedbackSchema = z.object({
  student_id: z.string().uuid(),
  message: z.string().min(3, "Escribe un mensaje para el estudiante."),
});

export async function sendFeedback(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase.from("feedback").insert({
    student_id: parsed.data.student_id,
    admin_id: user.id,
    message: parsed.data.message,
  });

  if (error) {
    return {
      error: "No se pudo enviar el feedback. Verifica que tu cuenta sea de administrador.",
    };
  }

  revalidatePath(`/admin/students/${parsed.data.student_id}`);
  return { success: true };
}

export async function markFeedbackRead(id: string) {
  const supabase = createClient();
  await supabase.rpc("mark_feedback_read", { feedback_id: id });
  revalidatePath("/dashboard/feedback");
  revalidatePath("/dashboard");
}
