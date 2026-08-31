import { Trash2, Instagram as InstagramIcon, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
} from "@/components/ui";
import { StatTile, ChartCard, TrendLineChart, RankingBarChart } from "@/components/charts";
import { summarizeInstagram } from "@/lib/metrics";
import { formatNumber, formatDate } from "@/lib/utils";
import { deleteInstagramMetric, deleteReel } from "@/lib/actions/instagram";
import type { InstagramMetric, Reel } from "@/lib/types";
import { MetricForm } from "./MetricForm";
import { ReelForm } from "./ReelForm";

export default async function InstagramPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: metrics }, { data: reels }] = await Promise.all([
    supabase
      .from("instagram_metrics")
      .select("*")
      .eq("student_id", user!.id)
      .order("metric_date", { ascending: false }),
    supabase
      .from("reels")
      .select("*")
      .eq("student_id", user!.id)
      .order("posted_at", { ascending: false }),
  ]);

  const summary = summarizeInstagram(
    (metrics ?? []) as InstagramMetric[],
    (reels ?? []) as Reel[]
  );

  return (
    <div>
      <PageHeader
        title="Instagram"
        description="Carga tus métricas manualmente para ver tu crecimiento y qué contenido funciona mejor."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile
          label="Seguidores actuales"
          value={summary.latest ? formatNumber(summary.latest.followers) : "—"}
          delta={summary.followerGrowthPct ?? undefined}
          deltaLabel="vs. hace ~30 días"
          trend={summary.trend.length > 1 ? summary.trend : undefined}
        />
        <StatTile
          label="Alcance promedio"
          value={summary.reachAvg ? formatNumber(Math.round(summary.reachAvg)) : "—"}
        />
        <StatTile
          label="Reel con más vistas"
          value={summary.bestReel ? formatNumber(summary.bestReel.views) : "—"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Crecimiento de seguidores"
          subtitle="Cada punto es un registro que cargaste"
          data={summary.chartData}
          columns={[
            { key: "date", label: "Fecha" },
            { key: "Seguidores", label: "Seguidores", align: "right" },
            { key: "Alcance", label: "Alcance", align: "right" },
          ]}
          empty="Agrega tu primera métrica para ver tu crecimiento aquí."
        >
          <TrendLineChart
            data={summary.chartData}
            xKey="date"
            series={[{ key: "Seguidores", label: "Seguidores" }]}
            valueFormatter={formatNumber}
          />
        </ChartCard>

        <ChartCard
          title="Reels que más potencian tu cuenta"
          subtitle="Ordenados por número de vistas"
          data={summary.topReels}
          columns={[
            { key: "title", label: "Reel" },
            { key: "views", label: "Vistas", align: "right" },
          ]}
          empty="Agrega tus reels para ver cuál funciona mejor."
        >
          <RankingBarChart
            data={summary.topReels}
            xKey="title"
            valueKey="views"
            valueFormatter={formatNumber}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargar métrica de hoy</CardTitle>
            <CardSubtitle>Sácalo de Instagram → tu perfil → panel profesional</CardSubtitle>
          </CardHeader>
          <CardBody>
            <MetricForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agregar un reel</CardTitle>
            <CardSubtitle>Registra el rendimiento de tu contenido</CardSubtitle>
          </CardHeader>
          <CardBody>
            <ReelForm />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de métricas</CardTitle>
          </CardHeader>
          <CardBody>
            {!metrics?.length ? (
              <EmptyState
                icon={<InstagramIcon size={28} />}
                title="Todavía no hay métricas"
                description="Carga tu primer registro con el formulario de arriba."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Fecha</TH>
                    <TH className="text-right">Seguidores</TH>
                    <TH className="text-right">Alcance</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {metrics.map((m) => (
                    <TR key={m.id}>
                      <TD>{formatDate(m.metric_date)}</TD>
                      <TD className="text-right tabular">{formatNumber(m.followers)}</TD>
                      <TD className="text-right tabular">{formatNumber(m.reach)}</TD>
                      <TD>
                        <form action={deleteInstagramMetric.bind(null, m.id)}>
                          <button
                            type="submit"
                            className="text-ink-muted hover:text-status-critical p-1"
                            aria-label="Eliminar métrica"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reels registrados</CardTitle>
          </CardHeader>
          <CardBody>
            {!reels?.length ? (
              <EmptyState
                icon={<Film size={28} />}
                title="Todavía no hay reels"
                description="Agrega tus reels para comparar su rendimiento."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Reel</TH>
                    <TH className="text-right">Vistas</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {reels.map((r) => (
                    <TR key={r.id}>
                      <TD className="max-w-[220px] truncate">{r.title}</TD>
                      <TD className="text-right tabular">{formatNumber(r.views)}</TD>
                      <TD>
                        <form action={deleteReel.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="text-ink-muted hover:text-status-critical p-1"
                            aria-label="Eliminar reel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
