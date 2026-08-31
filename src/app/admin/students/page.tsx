import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { StudentsTable, type StudentRow } from "./StudentsTable";
import type { Profile } from "@/lib/types";

export default async function AdminStudentsPage() {
  const supabase = createClient();

  const [{ data: profiles }, { data: metrics }, { data: sales }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
    supabase.from("instagram_metrics").select("student_id, followers, metric_date"),
    supabase.from("sales").select("student_id, unit_price, unit_cost, quantity"),
  ]);

  const latestFollowers = new Map<string, { followers: number; date: string }>();
  for (const m of (metrics ?? []) as any[]) {
    const existing = latestFollowers.get(m.student_id);
    if (!existing || m.metric_date > existing.date) {
      latestFollowers.set(m.student_id, { followers: m.followers, date: m.metric_date });
    }
  }

  const revenueByStudent = new Map<string, number>();
  const profitByStudent = new Map<string, number>();
  for (const s of (sales ?? []) as any[]) {
    revenueByStudent.set(
      s.student_id,
      (revenueByStudent.get(s.student_id) ?? 0) + Number(s.unit_price) * s.quantity
    );
    profitByStudent.set(
      s.student_id,
      (profitByStudent.get(s.student_id) ?? 0) +
        (Number(s.unit_price) - Number(s.unit_cost)) * s.quantity
    );
  }

  const students: StudentRow[] = ((profiles ?? []) as Profile[]).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    instagram_username: p.instagram_username,
    instagram_connected: p.instagram_connected,
    followers: latestFollowers.get(p.id)?.followers ?? null,
    revenue: revenueByStudent.get(p.id) ?? 0,
    profit: profitByStudent.get(p.id) ?? 0,
    created_at: p.created_at,
  }));

  return (
    <div>
      <PageHeader
        title="Estudiantes"
        description={`${students.length} estudiante${students.length === 1 ? "" : "s"} registrados en la plataforma.`}
      />
      <StudentsTable students={students} />
    </div>
  );
}
