import type {
  InstagramMetric,
  Reel,
  Product,
  Sale,
  PaymentMethod,
} from "@/lib/types";

export function sortByDateAsc<T extends Record<string, any>>(
  rows: T[],
  key: string
): T[] {
  return [...rows].sort(
    (a, b) => new Date(a[key]).getTime() - new Date(b[key]).getTime()
  );
}

function formatDateShort(dateStr: string) {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateStr + "T00:00:00"));
}

/* ------------------------------------------------------------------------ */
/*  Instagram                                                                */
/* ------------------------------------------------------------------------ */

export interface InstagramSummary {
  latest: InstagramMetric | null;
  previous: InstagramMetric | null;
  followerGrowthPct: number | null;
  reachAvg: number | null;
  chartData: { date: string; Seguidores: number; Alcance: number }[];
  trend: number[];
  topReels: { title: string; views: number; id: string }[];
  bestReel: Reel | null;
}

export function summarizeInstagram(
  metrics: InstagramMetric[],
  reels: Reel[]
): InstagramSummary {
  const sorted = sortByDateAsc(metrics, "metric_date");
  const latest = sorted[sorted.length - 1] ?? null;

  let previous: InstagramMetric | null = null;
  if (latest) {
    const latestTime = new Date(latest.metric_date).getTime();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const olderCandidates = sorted.filter(
      (m) =>
        m.id !== latest.id &&
        new Date(m.metric_date).getTime() <= latestTime - THIRTY_DAYS
    );
    previous =
      olderCandidates[olderCandidates.length - 1] ??
      (sorted.length > 1 ? sorted[0] : null);
  }

  const followerGrowthPct =
    latest && previous && previous.followers > 0
      ? ((latest.followers - previous.followers) / previous.followers) * 100
      : null;

  const reachAvg = sorted.length
    ? sorted.reduce((sum, m) => sum + m.reach, 0) / sorted.length
    : null;

  const chartData = sorted.map((m) => ({
    date: formatDateShort(m.metric_date),
    Seguidores: m.followers,
    Alcance: m.reach,
  }));

  const trend = sorted.slice(-12).map((m) => m.followers);

  const sortedReels = [...reels].sort((a, b) => b.views - a.views);
  const topReels = sortedReels
    .slice(0, 8)
    .map((r) => ({ title: r.title, views: r.views, id: r.id }));
  const bestReel = sortedReels[0] ?? null;

  return { latest, previous, followerGrowthPct, reachAvg, chartData, trend, topReels, bestReel };
}

/* ------------------------------------------------------------------------ */
/*  Negocio de reventa                                                       */
/* ------------------------------------------------------------------------ */

export interface BusinessSummary {
  totalInvested: number;
  totalRevenue: number;
  totalProfit: number;
  unitsSold: number;
  marginPct: number | null;
  byPaymentMethod: { method: PaymentMethod; total: number }[];
  profitByMonth: { month: string; profit: number }[];
  revenueTrend: number[];
  topProducts: { name: string; profit: number }[];
}

export function summarizeBusiness(
  products: Product[],
  sales: Sale[]
): BusinessSummary {
  const totalInvested = products.reduce(
    (sum, p) => sum + Number(p.cost_per_unit) * p.quantity_purchased,
    0
  );
  const totalRevenue = sales.reduce(
    (sum, s) => sum + Number(s.unit_price) * s.quantity,
    0
  );
  const totalCostOfSales = sales.reduce(
    (sum, s) => sum + Number(s.unit_cost) * s.quantity,
    0
  );
  const totalProfit = totalRevenue - totalCostOfSales;
  const unitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
  const marginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : null;

  const methodTotals = new Map<PaymentMethod, number>();
  for (const s of sales) {
    methodTotals.set(
      s.payment_method,
      (methodTotals.get(s.payment_method) ?? 0) + Number(s.unit_price) * s.quantity
    );
  }
  const byPaymentMethod = Array.from(methodTotals.entries()).map(
    ([method, total]) => ({ method, total })
  );

  const sortedSales = sortByDateAsc(sales, "sale_date");
  const monthTotals = new Map<string, number>();
  for (const s of sortedSales) {
    const d = new Date(s.sale_date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const profit = (Number(s.unit_price) - Number(s.unit_cost)) * s.quantity;
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + profit);
  }
  const profitByMonth = Array.from(monthTotals.entries()).map(([key, profit]) => {
    const [y, m] = key.split("-");
    const label = new Intl.DateTimeFormat("es-US", {
      month: "short",
      year: "2-digit",
    }).format(new Date(Number(y), Number(m) - 1, 1));
    return { month: label, profit: Math.round(profit * 100) / 100 };
  });

  const monthRevenue = new Map<string, number>();
  for (const s of sortedSales) {
    const d = new Date(s.sale_date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthRevenue.set(
      key,
      (monthRevenue.get(key) ?? 0) + Number(s.unit_price) * s.quantity
    );
  }
  const revenueTrend = Array.from(monthRevenue.values()).slice(-12);

  const productProfits = new Map<string, number>();
  for (const s of sales) {
    const profit = (Number(s.unit_price) - Number(s.unit_cost)) * s.quantity;
    productProfits.set(
      s.product_name,
      (productProfits.get(s.product_name) ?? 0) + profit
    );
  }
  const topProducts = Array.from(productProfits.entries())
    .map(([name, profit]) => ({ name, profit: Math.round(profit * 100) / 100 }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8);

  return {
    totalInvested,
    totalRevenue,
    totalProfit,
    unitsSold,
    marginPct,
    byPaymentMethod,
    profitByMonth,
    revenueTrend,
    topProducts,
  };
}
