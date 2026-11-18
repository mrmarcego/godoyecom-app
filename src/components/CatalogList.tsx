import { Download, FileText } from "lucide-react";
import { Card, CardBody, PageHeader } from "@/components/ui";
import { CATALOGS, catalogUrl } from "@/lib/catalogs";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CatalogList() {
  return (
    <div>
      <PageHeader
        title="Catálogos"
        description="Descarga la versión más reciente de los catálogos para compartirla con tus clientes."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {CATALOGS.map((c) => (
          <Card key={c.slug}>
            <CardBody className="flex flex-col gap-4 h-full">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-brand-black text-brand-green p-2.5 shrink-0">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-primary">{c.title}</p>
                  <p className="text-sm text-ink-secondary mt-0.5">{c.description}</p>
                  <p className="text-xs text-ink-muted mt-2">
                    Actualizado el {formatDate(c.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <a
                  href={catalogUrl(c)}
                  download={c.file.split("/").pop()}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm rounded-xl bg-brand-green text-brand-black hover:bg-brand-green-dark font-semibold transition-colors"
                >
                  <Download size={16} /> Descargar PDF
                </a>
                <a
                  href={catalogUrl(c)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 text-sm rounded-xl bg-white text-ink-primary border border-line-baseline hover:bg-surface-sunken transition-colors"
                >
                  Ver
                </a>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
