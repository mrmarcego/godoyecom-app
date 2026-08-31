"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, TableProperties, LineChart as LineChartIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui";
import { cn, formatCompactNumber, formatCurrency, formatCurrencyPrecise, formatNumber } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

/* ------------------------------------------------------------------------ */
/*  Tokens (del sistema de dataviz, superficie oscura = negro de marca)      */
/* ------------------------------------------------------------------------ */

export const DARK = {
  surface: "#1a1a1a",
  page: "#141414",
  textPrimary: "#feffff",
  textSecondary: "#c3c2b7",
  muted: "#898781",
  grid: "#2c2c2a",
  baseline: "#383835",
  ring: "rgba(255,255,255,0.10)",
};

// Paleta categórica validada (pasos "dark"), orden fijo — nunca se reordena por serie.
export const SERIES_DARK = [
  "#3987e5", // 1 azul
  "#d95926", // 2 naranja
  "#199e70", // 3 aqua
  "#c98500", // 4 amarillo
  "#d55181", // 5 magenta
  "#008300", // 6 verde
  "#9085e9", // 7 violeta
  "#e66767", // 8 rojo
];

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

// Acento de marca (verde lima) — reservado para series únicas / de una sola
// medida (p. ej. crecimiento de seguidores), donde no compite con la
// identidad categórica y su contraste sobre el negro de marca es alto.
export const BRAND_ACCENT = "#b7ef10";

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  efectivo: SERIES_DARK[0],
  zelle: SERIES_DARK[1],
  transferencia: SERIES_DARK[2],
  tarjeta: SERIES_DARK[3],
  otro: SERIES_DARK[4],
};

/* ------------------------------------------------------------------------ */
/*  StatTile                                                                 */
/* ------------------------------------------------------------------------ */

export interface StatTileProps {
  label: string;
  value: string;
  delta?: number | null; // porcentaje; positivo = sube, negativo = baja
  deltaLabel?: string;
  upIsGood?: boolean; // si false, subir se pinta como "malo" (p.ej. gasto)
  trend?: number[]; // serie corta para el sparkline
}

export function StatTile({
  label,
  value,
  delta,
  deltaLabel = "vs. periodo anterior",
  upIsGood = true,
  trend,
}: StatTileProps) {
  const hasDelta = typeof delta === "number" && !Number.isNaN(delta);
  const isUp = hasDelta && (delta as number) > 0;
  const isDown = hasDelta && (delta as number) < 0;
  const isGood = (isUp && upIsGood) || (isDown && !upIsGood);
  const isBad = (isUp && !upIsGood) || (isDown && upIsGood);

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <span className="text-sm text-ink-secondary">{label}</span>
        <span className="text-3xl font-bold text-ink-primary leading-tight">
          {value}
        </span>
        <div className="flex items-center justify-between min-h-[20px]">
          {hasDelta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                isGood && "text-status-good",
                isBad && "text-status-critical",
                !isGood && !isBad && "text-ink-muted"
              )}
              title={deltaLabel}
            >
              {isUp && <ArrowUpRight size={14} />}
              {isDown && <ArrowDownRight size={14} />}
              {!isUp && !isDown && <Minus size={14} />}
              {Math.abs(delta as number).toFixed(1)}%
            </span>
          ) : (
            <span />
          )}
          {trend && trend.length > 1 && (
            <Sparkline data={trend} good={isGood || (!isGood && !isBad)} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function Sparkline({
  data,
  width = 72,
  height = 24,
  good = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  good?: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
  const [lastX, lastY] = points[points.length - 1];
  const dot = good ? STATUS.good : STATUS.critical;

  return (
    <svg width={width} height={height} aria-hidden>
      <path d={path} fill="none" stroke="#c3c2b7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={3} fill={dot} stroke="#fcfcfb" strokeWidth={1.5} />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/*  ChartCard — envoltorio con superficie oscura de marca + vista de tabla   */
/* ------------------------------------------------------------------------ */

// Los Server Components de este proyecto no pueden pasar funciones como
// props a este archivo (es "use client"), así que el formato de cada
// columna/serie se elige por nombre y se resuelve aquí adentro.
export type FormatterKey = "currency" | "currencyPrecise" | "number" | "compact";

const FORMATTERS: Record<FormatterKey, (v: any) => string> = {
  currency: formatCurrency,
  currencyPrecise: formatCurrencyPrecise,
  number: formatNumber,
  compact: formatCompactNumber,
};

export interface ChartColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: FormatterKey;
}

export function ChartCard({
  title,
  subtitle,
  data,
  columns,
  height = 280,
  children,
  empty,
}: {
  title: string;
  subtitle?: string;
  data: any[];
  columns: ChartColumn[];
  height?: number;
  children: React.ReactNode;
  empty?: string;
}) {
  const [asTable, setAsTable] = React.useState(false);
  const hasData = data && data.length > 0;

  return (
    <div className="rounded-2xl bg-brand-black overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-[#c3c2b7] mt-0.5">{subtitle}</p>}
        </div>
        {hasData && (
          <button
            onClick={() => setAsTable((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-[#c3c2b7] hover:bg-white/5 shrink-0"
            aria-label="Alternar entre gráfica y tabla"
          >
            {asTable ? <LineChartIcon size={14} /> : <TableProperties size={14} />}
            {asTable ? "Ver gráfica" : "Ver tabla"}
          </button>
        )}
      </div>

      <div className="p-5 pt-4">
        {!hasData ? (
          <div
            className="flex items-center justify-center text-sm text-[#898781]"
            style={{ height }}
          >
            {empty ?? "Aún no hay datos suficientes para mostrar esta gráfica."}
          </div>
        ) : asTable ? (
          <div className="overflow-x-auto rounded-lg border border-white/10" style={{ maxHeight: height }}>
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={cn(
                        "px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#898781] whitespace-nowrap",
                        c.align === "right" ? "text-right" : "text-left"
                      )}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          "px-3 py-2 text-[#feffff] tabular",
                          c.align === "right" ? "text-right" : "text-left"
                        )}
                      >
                        {c.format ? FORMATTERS[c.format](row[c.key]) : String(row[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*  Tooltip oscuro reutilizable                                              */
/* ------------------------------------------------------------------------ */

function DarkTooltip({ active, payload, label, valueFormatter }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#141414] px-3 py-2 shadow-lg">
      {label && <p className="text-xs text-[#898781] mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: p.color || p.fill }}
          />
          <span className="text-[#c3c2b7]">{p.name}:</span>
          <span className="text-white font-medium tabular">
            {valueFormatter ? valueFormatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*  Gráfica de línea (crecimiento / tendencia)                               */
/* ------------------------------------------------------------------------ */

export interface SeriesSpec {
  key: string;
  label: string;
  color?: string;
}

export function TrendLineChart({
  data,
  xKey,
  series,
  valueFormatter = "compact",
  area = false,
}: {
  data: any[];
  xKey: string;
  series: SeriesSpec[];
  valueFormatter?: FormatterKey;
  area?: boolean;
}) {
  const formatFn = FORMATTERS[valueFormatter] ?? formatCompactNumber;
  const Chart = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={DARK.grid} strokeDasharray="0" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: DARK.muted, fontSize: 12 }}
          axisLine={{ stroke: DARK.baseline }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: DARK.muted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatFn}
          width={44}
        />
        <Tooltip content={<DarkTooltip valueFormatter={formatFn} />} />
        {series.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: DARK.textSecondary }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {series.map((s, i) => {
          const color = s.color ?? (series.length === 1 ? BRAND_ACCENT : SERIES_DARK[i % SERIES_DARK.length]);
          return area ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              fill={color}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ r: 3, fill: color, stroke: DARK.surface, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: color, stroke: DARK.surface, strokeWidth: 2 }}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, stroke: DARK.surface, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: color, stroke: DARK.surface, strokeWidth: 2 }}
            />
          );
        })}
      </Chart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------------ */
/*  Gráfica de barras categórica (ranking / comparación)                     */
/* ------------------------------------------------------------------------ */

export function RankingBarChart({
  data,
  xKey,
  valueKey,
  valueFormatter = "compact",
  colorKey,
  colorMap,
  layout = "vertical", // "vertical" = barras horizontales (recharts layout vertical)
}: {
  data: any[];
  xKey: string;
  valueKey: string;
  valueFormatter?: FormatterKey;
  colorKey?: string;
  colorMap?: Record<string, string>;
  layout?: "vertical" | "horizontal";
}) {
  const formatFn = FORMATTERS[valueFormatter] ?? formatCompactNumber;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={layout !== "vertical"} vertical={layout === "vertical"} stroke={DARK.grid} />
        {layout === "vertical" ? (
          <>
            <XAxis type="number" tick={{ fill: DARK.muted, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatFn} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fill: DARK.textSecondary, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: DARK.muted, fontSize: 12 }} axisLine={{ stroke: DARK.baseline }} tickLine={false} />
            <YAxis tick={{ fill: DARK.muted, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatFn} width={44} />
          </>
        )}
        <Tooltip content={<DarkTooltip valueFormatter={formatFn} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={valueKey} radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={24}>
          {data.map((row, i) => (
            <Cell
              key={i}
              fill={
                colorKey && colorMap
                  ? colorMap[row[colorKey]] ?? BRAND_ACCENT
                  : BRAND_ACCENT
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------------ */
/*  Gráfica de barras por signo (ganancia / pérdida por periodo)             */
/* ------------------------------------------------------------------------ */

export function SignedBarChart({
  data,
  xKey,
  valueKey,
  valueFormatter = "currency",
}: {
  data: any[];
  xKey: string;
  valueKey: string;
  valueFormatter?: FormatterKey;
}) {
  const formatFn = FORMATTERS[valueFormatter] ?? formatCurrency;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap={10}>
        <CartesianGrid vertical={false} stroke={DARK.grid} />
        <XAxis dataKey={xKey} tick={{ fill: DARK.muted, fontSize: 12 }} axisLine={{ stroke: DARK.baseline }} tickLine={false} />
        <YAxis tick={{ fill: DARK.muted, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatFn} width={52} />
        <Tooltip content={<DarkTooltip valueFormatter={formatFn} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={valueKey} radius={[4, 4, 4, 4]} maxBarSize={24}>
          {data.map((row, i) => (
            <Cell key={i} fill={row[valueKey] >= 0 ? STATUS.good : STATUS.critical} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------------ */
/*  Leyenda simple de métodos de pago (para reutilizar fuera de un chart)    */
/* ------------------------------------------------------------------------ */

export function PaymentMethodLegend({ labels }: { labels: Record<PaymentMethod, string> }) {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.keys(PAYMENT_METHOD_COLORS) as PaymentMethod[]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="h-2 w-2 rounded-full" style={{ background: PAYMENT_METHOD_COLORS[k] }} />
          {labels[k]}
        </span>
      ))}
    </div>
  );
}
