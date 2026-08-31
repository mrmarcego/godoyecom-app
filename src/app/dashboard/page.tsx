import Link from "next/link";
import { ArrowRight, Instagram as InstagramIcon, ShoppingBag, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, CardBody } from "@/components/ui";
import { StatTile, ChartCard, TrendLineChart, SignedBarChart } from "@/components/charts";
import { summarizeInstagram, summarizeBusiness } from "@/lib/metrics";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { InstagramMetric, Reel, Product, Sale } from "@/lib/types";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: metrics },
    { data: reels },
    { data: products },
    { data: sales },
    { data: feedback },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
    supabase
      .from("instagram_metrics")
      .select("*")
      .eq("student_id", user!.id)
      .order("metric_date", { ascending: false }),
    supabase.from("reels").select("*").eq("student_id", user!.id),
    supabase.from("products").select("*").eq("student_id", user!.id),
    supabase.from("sales").select("*").eq("student_id", user!.id),
    supabase
      .from("feedback")
      .select("id, read_at")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const ig = summarizeInstagram((metrics ?? []) as InstagramMetric[], (reels ?? []) as Reel[]);
  const biz = summarizeBusiness((products ?? []) as Product[], (sales ?? []) as Sale[]);
  const firstName = (profile?.full_name || "").split(" ")[0] || "";
  const latestFeedback = feedback?.[0];

  return (
    <div>
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Tu resumen"}
        description="Así va tu crecimiento en Instagram y tu negocio de reventa."
      />

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
          height={220}
          empty="Carga tu primera métrica de Instagram para ver tu progreso."
        >
          <TrendLineChart
            data={ig.chartData}
            xKey="date"
            series={[{ key: "Seguidores", label: "Seguidores" }]}
            valueFormatter={formatNumber}
          />
        </ChartCard>
        <ChartCard
          title="Ganancia por mes"
          data={biz.profitByMonth}
          columns={[
            { key: "month", label: "Mes" },
            { key: "profit", label: "Ganancia", align: "right", format: (v) => formatCurrency(v) },
          ]}
          height={220}
          empty="Registra tu primera venta para ver tu ganancia."
        >
          <SignedBarChart data={biz.profitByMonth} xKey="month" valueKey="profit" valueFormatter={formatCurrency} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/instagram" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-black text-brand-green shrink-0">
                <InstagramIcon size={18} />
              </span>
              <span className="flex-1 text-sm font-medium text-ink-primary">
                Ver detalle de Instagram
              </span>
              <ArrowRight size={16} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
            </CardBody>
          </Card>
        </Link>
        <Link href="/dashboard/business" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-black text-brand-green shrink-0">
                <ShoppingBag size={18} />
              </span>
              <span className="flex-1 text-sm font-medium text-ink-primary">
                Ver detalle de mi negocio
              </span>
              <ArrowRight size={16} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
            </CardBody>
          </Card>
        </Link>
        <Link href="/dashboard/feedback" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-black text-brand-green shrink-0">
                <MessageSquare size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-ink-primary">Feedback del equipo</span>
                {latestFeedback && !latestFeedback.read_at && (
                  <span className="block text-xs text-status-good">Tienes un mensaje nuevo</span>
                )}
              </span>
              <ArrowRight size={16} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
