"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/auth";

const productSchema = z.object({
  name: z.string().min(1, "Ponle un nombre al producto."),
  category: z.string().optional(),
  cost_per_unit: z.coerce.number().min(0),
  quantity_purchased: z.coerce.number().int().min(0),
  purchase_date: z.string().min(1, "Elige una fecha."),
  notes: z.string().optional(),
});

export async function addProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("products")
    .insert({ student_id: user.id, ...parsed.data });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard");
}

const saleSchema = z.object({
  product_id: z.string().optional(),
  product_name: z.string().min(1, "Indica qué producto vendiste."),
  quantity: z.coerce.number().int().min(1),
  unit_cost: z.coerce.number().min(0),
  unit_price: z.coerce.number().min(0),
  payment_method: z.enum(["efectivo", "zelle", "transferencia", "tarjeta", "otro"]),
  sale_date: z.string().min(1, "Elige una fecha."),
  notes: z.string().optional(),
});

export async function addSale(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.product_id) delete raw.product_id;

  const parsed = saleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { product_id, ...rest } = parsed.data;

  const { error } = await supabase.from("sales").insert({
    student_id: user.id,
    product_id: product_id || null,
    ...rest,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSale(id: string) {
  const supabase = createClient();
  await supabase.from("sales").delete().eq("id", id);
  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard");
}
