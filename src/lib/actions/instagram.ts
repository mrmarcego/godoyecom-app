"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/auth";

const metricSchema = z.object({
  metric_date: z.string().min(1, "Elige una fecha."),
  followers: z.coerce.number().int().min(0),
  following: z.coerce.number().int().min(0).default(0),
  posts_count: z.coerce.number().int().min(0).default(0),
  reach: z.coerce.number().int().min(0).default(0),
  profile_visits: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export async function addInstagramMetric(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const parsed = metricSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("instagram_metrics")
    .upsert(
      { student_id: user.id, ...parsed.data },
      { onConflict: "student_id,metric_date" }
    );

  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ instagram_connected: true })
    .eq("id", user.id);

  revalidatePath("/dashboard/instagram");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteInstagramMetric(id: string) {
  const supabase = createClient();
  await supabase.from("instagram_metrics").delete().eq("id", id);
  revalidatePath("/dashboard/instagram");
  revalidatePath("/dashboard");
}

const reelSchema = z.object({
  posted_at: z.string().min(1, "Elige una fecha."),
  title: z.string().min(1, "Ponle un título o descripción al reel."),
  url: z.string().optional(),
  views: z.coerce.number().int().min(0).default(0),
  likes: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  shares: z.coerce.number().int().min(0).default(0),
  saves: z.coerce.number().int().min(0).default(0),
});

export async function addReel(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const parsed = reelSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("reels")
    .insert({ student_id: user.id, ...parsed.data });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/instagram");
  return { success: true };
}

export async function deleteReel(id: string) {
  const supabase = createClient();
  await supabase.from("reels").delete().eq("id", id);
  revalidatePath("/dashboard/instagram");
}
