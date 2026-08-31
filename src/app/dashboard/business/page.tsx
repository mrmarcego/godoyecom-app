import { Trash2, Package, Receipt } from "lucide-react";
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
  Badge,
} from "@/components/ui";
import {
  StatTile,
  ChartCard,
  SignedBarChart,
  RankingBarChart,
  PAYMENT_METHOD_COLORS,
} from "@/components/charts";
import { summarizeBusiness } from "@/lib/metrics";
import { formatCurrency, formatCurrencyPrecise, formatNumber, formatDate } from "@/lib/utils";
import { deleteProduct, deleteSale } from "@/lib/actions/business";
import { PAYMENT_METHOD_LABELS, type Product, type Sale } from "@/lib/types";
import { ProductForm } from "./ProductForm";
import { SaleForm } from "./SaleForm";

export default async function BusinessPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: products }, { data: sales }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("student_id", user!.id)
      .order("purchase_date", { ascending: false }),
    supabase
      .from("sales")
      .select("*")
      .eq("student_id", user!.id)
      .order("sale_date", { ascending: false }),
  ]);

  const productRows = (products ?? []) as Product[];
  const salesRows = (sales ?? []) as Sale[];

  const summary = summarizeBusiness(productRows, salesRows);

  const paymentData = summary.byPaymentMethod.map((p) => ({
    method: p.method,
    methodLabel: PAYMENT_METHOD_LABELS[p.method],
    total: Math.round(p.total * 100) / 100,
  }));

  const productNames = Array.from(new Set(productRows.map((p) => p.name)));

  return (
    <div>
      <PageHeader
        title="Mi negocio"
        description="Lleva el control de tu inversión, tus ventas y tu ganancia real."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total invertido" value={formatCurrency(summary.totalInvested)} />
        <StatTile label="Total vendido" value={formatCurrency(summary.totalRevenue)} trend={summary.revenueTrend.length > 1 ? summary.revenueTrend : undefined} />
        <StatTile
          label="Ganancia neta"
          value={formatCurrency(summary.totalProfit)}
          delta={summary.marginPct ?? undefined}
          deltaLabel="margen sobre ventas"
        />
        <StatTile
          label="Unidades vendidas"
          value={formatNumber(summary.unitsSold)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Ganancia por mes"
          subtitle="Ventas menos costo de lo vendido"
          data={summary.profitByMonth}
          columns={[
            { key: "month", label: "Mes" },
            { key: "profit", label: "Ganancia", align: "right", format: "currencyPrecise" },
          ]}
          empty="Registra ventas para ver tu ganancia por mes."
        >
          <SignedBarChart data={summary.profitByMonth} xKey="month" valueKey="profit" valueFormatter="currency" />
        </ChartCard>

        <ChartCard
          title="Ventas por método de pago"
          subtitle="Efectivo, Zelle y demás"
          data={paymentData}
          columns={[
            { key: "methodLabel", label: "Método" },
            { key: "total", label: "Total", align: "right", format: "currencyPrecise" },
          ]}
          empty="Registra ventas para ver el desglose por método de pago."
        >
          <RankingBarChart
            data={paymentData}
            xKey="methodLabel"
            valueKey="total"
            valueFormatter="currency"
            colorKey="method"
            colorMap={PAYMENT_METHOD_COLORS}
            layout="horizontal"
          />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Productos más rentables"
          subtitle="Ganancia acumulada por producto"
          data={summary.topProducts}
          columns={[
            { key: "name", label: "Producto" },
            { key: "profit", label: "Ganancia", align: "right", format: "currencyPrecise" },
          ]}
          height={260}
          empty="Registra ventas para ver tus productos más rentables."
        >
          <RankingBarChart data={summary.topProducts} xKey="name" valueKey="profit" valueFormatter="currency" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Agregar producto / inversión</CardTitle>
            <CardSubtitle>Lo que compraste para revender</CardSubtitle>
          </CardHeader>
          <CardBody>
            <ProductForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Registrar venta</CardTitle>
            <CardSubtitle>Lo que vendiste y cómo te pagaron</CardSubtitle>
          </CardHeader>
          <CardBody>
            <SaleForm productNames={productNames} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardBody>
            {!productRows.length ? (
              <EmptyState icon={<Package size={28} />} title="Todavía no hay productos" description="Agrega lo que compraste para revender." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Producto</TH>
                    <TH className="text-right">Costo</TH>
                    <TH className="text-right">Cant.</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {productRows.map((p) => (
                    <TR key={p.id}>
                      <TD className="max-w-[160px] truncate">{p.name}</TD>
                      <TD className="text-right tabular">{formatCurrencyPrecise(p.cost_per_unit)}</TD>
                      <TD className="text-right tabular">{p.quantity_purchased}</TD>
                      <TD>
                        <form action={deleteProduct.bind(null, p.id)}>
                          <button type="submit" className="text-ink-muted hover:text-status-critical p-1" aria-label="Eliminar producto">
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
            <CardTitle>Ventas recientes</CardTitle>
          </CardHeader>
          <CardBody>
            {!salesRows.length ? (
              <EmptyState icon={<Receipt size={28} />} title="Todavía no hay ventas" description="Registra tu primera venta arriba." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Producto</TH>
                    <TH>Pago</TH>
                    <TH className="text-right">Ganancia</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {salesRows.map((s) => (
                    <TR key={s.id}>
                      <TD className="max-w-[140px] truncate">{s.product_name}</TD>
                      <TD>
                        <Badge variant="muted">{PAYMENT_METHOD_LABELS[s.payment_method]}</Badge>
                      </TD>
                      <TD className="text-right tabular">
                        {formatCurrencyPrecise((s.unit_price - s.unit_cost) * s.quantity)}
                      </TD>
                      <TD>
                        <form action={deleteSale.bind(null, s.id)}>
                          <button type="submit" className="text-ink-muted hover:text-status-critical p-1" aria-label="Eliminar venta">
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
