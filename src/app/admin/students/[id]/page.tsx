import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  Badge,
  Avatar,
} from "@/components/ui";
import {
  StatTile,
  ChartCard,
  TrendLineChart,
  RankingBarChart,
  SignedBarChart,
  PAYMENT_METHOD_COLORS,
} from "@/components/charts";
import { summarizeInstagram, summarizeBusiness } from "@/lib/metrics";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatNumber,
  formatDateTime,
} from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  type Profile,
  type InstagramMetric,
  type Reel,
  type Product,
  type Sale,
} from "@/lib/types";
import { FeedbackForm } from "./FeedbackForm";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [
    { data: profile },
    { data: metrics },
    { data: reels },
    { data: products },
    { data: sales },
    { data: feedback },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).single(),
    supabase
      .from("instagram_metrics")
      .select("*")
      .eq("student_id", params.id)
      .order("metric_date", { ascending: false }),
    supabase
      .from("reels")
      .select("*")
      .eq("student_id", params.id)
      .order("posted_at", { ascending: false }),
    supabase.from("products").select("*").eq("student_id", params.id),
    supabase.from("sales").select("*").eq("student_id", params.id),
    supabase
      .from("feedback")
      .select("id, message, created_at, admin:admin_id(full_name)")
      .eq("student_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const p = profile as Profile;
  const ig = summarizeInstagram(
    (metrics ?? []) as InstagramMetric[],
    (reels ?? []) as Reel[]
  );
  const biz = summarizeBusiness((products ?? []) as Product[], (sales ?? []) as Sale[]);

  const paymentData = biz.byPaymentMethod.map((x) => ({
    method: x.method,
    methodLabel: PAYMENT_METHOD_LABELS[x.method],
    total: Math.round(x.total * 100) / 100,
  }));

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={p.full_name || p.email} size="lg" />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-ink-primary truncate">
            {p.full_name || "Sin nombre"}
          </h1>
          <p className="text-sm text-ink-secondary truncate">{p.email}</p>
        </div>
        <div className="ml-auto shrink-0">
          {p.instagram_connected ? (
            <Badge variant="good">
              {p.instagram_username ? `@${p.instagram_username}` : "Instagram conectado"}
            </Badge>
          ) : (
            <Badge variant="muted">Sin datos de Instagram</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Seguidores"
          value={ig.latest ? formatNumber(ig.latest.followers) : "—"}
          delta={ig.followerGrowthPct ?? undefined}
          deltaLabel="vs. hace ~30 días"
          trend={ig.trend.length > 1 ? ig.trend : undefined}
        />
        <StatTile label="Total invertido" value={formatCurrency(biz.totalInvested)} />
        <StatTile label="Total vendido" value={formatCurrency(biz.totalRevenue)} />
        <StatTile
          label="Ganancia neta"
          value={formatCurrency(biz.totalProfit)}
          delta={biz.marginPct ?? undefined}
          deltaLabel="margen sobre ventas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Crecimiento de seguidores"
          data={ig.chartData}
          columns={[
            { key: "date", label: "Fecha" },
            { key: "Seguidores", label: "Seguidores", align: "right" },
          ]}
          empty="Este estudiante todavía no ha cargado métricas de Instagram."
        >
          <TrendLineChart
            data={ig.chartData}
            xKey="date"
            series={[{ key: "Seguidores", label: "Seguidores" }]}
            valueFormatter={formatNumber}
          />
        </ChartCard>
        <ChartCard
          title="Reels con más vistas"
          data={ig.topReels}
          columns={[
            { key: "title", label: "Reel" },
            { key: "views", label: "Vistas", align: "right" },
          ]}
          empty="Este estudiante todavía no ha registrado reels."
        >
          <RankingBarChart data={ig.topReels} xKey="title" valueKey="views" valueFormatter={formatNumber} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Ganancia por mes"
          data={biz.profitByMonth}
          columns={[
            { key: "month", label: "Mes" },
            { key: "profit", label: "Ganancia", align: "right", format: (v) => formatCurrencyPrecise(v) },
          ]}
          empty="Este estudiante todavía no ha registrado ventas."
        >
          <SignedBarChart data={biz.profitByMonth} xKey="month" valueKey="profit" valueFormatter={formatCurrency} />
        </ChartCard>
        <ChartCard
          title="Ventas por método de pago"
          data={paymentData}
          columns={[
            { key: "methodLabel", label: "Método" },
            { key: "total", label: "Total", align: "right", format: (v) => formatCurrencyPrecise(v) },
          ]}
          empty="Este estudiante todavía no ha registrado ventas."
        >
          <RankingBarChart
            data={paymentData}
            xKey="methodLabel"
            valueKey="total"
            valueFormatter={formatCurrency}
            colorKey="method"
            colorMap={PAYMENT_METHOD_COLORS}
            layout="horizontal"
          />
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback privado</CardTitle>
          <CardSubtitle>Solo tú y este estudiante pueden ver estos mensajes.</CardSubtitle>
        </CardHeader>
        <CardBody>
          <div className="mb-5">
            <FeedbackForm studentId={p.id} />
          </div>
          {!feedback?.length ? (
            <p className="text-sm text-ink-muted">
              Todavía no le has dejado feedback a este estudiante.
            </p>
          ) : (
            <div className="space-y-3">
              {(feedback as any[]).map((f) => (
                <div key={f.id} className="rounded-lg border border-line-grid p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ink-secondary">
                      {f.admin?.full_name || "Tú"}
                    </span>
                    <span className="text-xs text-ink-muted">{formatDateTime(f.created_at)}</span>
                  </div>
                  <p className="text-sm text-ink-primary whitespace-pre-wrap">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
