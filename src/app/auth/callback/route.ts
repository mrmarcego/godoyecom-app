import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirige aquí después de confirmar el correo (si el proyecto
// tiene activada la confirmación por email).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
