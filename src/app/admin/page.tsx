import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, CardBody } from "@/components/ui";
import { StatTile, ChartCard, RankingBarChart } from "@/components/charts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default async function AdminOverviewPage() {
  const supabase = createClient();

  const [{ data: profiles }, { data: sales }, { data: products }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "student"),
    supabase.from("sales").select("student_id, unit_price, unit_cost, quantity"),
    supabase.from("products").select("student_id, cost_per_unit, quantity_purchased"),
  ]);

  const students = (profiles ?? []) as Profile[];
  const totalStudents = students.length;
  const connectedCount = students.filter((s) => s.instagram_connected).length;

  const totalRevenue = (sales ?? []).reduce(
    (sum, s: any) => sum + Number(s.unit_price) * s.quantity,
    0
  );
  const totalCost = (sales ?? []).reduce(
    (sum, s: any) => sum + Number(s.unit_cost) * s.quantity,
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const totalInvested = (products ?? []).reduce(
    (sum, p: any) => sum + Number(p.cost_per_unit) * p.quantity_purchased,
    0
  );

  const profitByStudent = new Map<string, number>();
  for (const s of (sales ?? []) as any[]) {
    profitByStudent.set(
      s.student_id,
      (profitByStudent.get(s.student_id) ?? 0) +
        (Number(s.unit_price) - Number(s.unit_cost)) * s.quantity
    );
  }
  const topStudents = Array.from(profitByStudent.entries())
    .map(([id, profit]) => ({
      name: students.find((s) => s.id === id)?.full_name || "—",
      profit: Math.round(profit * 100) / 100,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Panel de administrador"
        description="Vista general de todos los estudiantes de Godoyecom."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Estudiantes registrados" value={formatNumber(totalStudents)} />
        <StatTile
          label="Reportando Instagram"
          value={`${formatNumber(connectedCount)} (${
            totalStudents ? Math.round((connectedCount / totalStudents) * 100) : 0
          }%)`}
        />
        <StatTile label="Ventas totales generadas" value={formatCurrency(totalRevenue)} />
        <StatTile label="Ganancia total generada" value={formatCurrency(totalProfit)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Estudiantes con más ganancia"
          subtitle="Top 8 por ganancia acumulada en su negocio"
          data={topStudents}
          columns={[
            { key: "name", label: "Estudiante" },
            { key: "profit", label: "Ganancia", align: "right", format: (v) => formatCurrency(v) },
          ]}
          empty="Todavía no hay ventas registradas por los estudiantes."
        >
          <RankingBarChart data={topStudents} xKey="name" valueKey="profit" valueFormatter={formatCurrency} />
        </ChartCard>

        <Card>
          <CardBody className="flex flex-col gap-3 h-full justify-center">
            <p className="text-sm text-ink-secondary">
              Total invertido por todos los estudiantes
            </p>
            <p className="text-3xl font-bold text-ink-primary">{formatCurrency(totalInvested)}</p>
            <p className="text-sm text-ink-secondary mt-4">
              Revisa el detalle de cada estudiante — sus métricas de Instagram, su negocio y el
              feedback privado que le has dejado — en{" "}
              <Link href="/admin/students" className="text-brand-green-deep font-medium underline">
                Estudiantes
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
