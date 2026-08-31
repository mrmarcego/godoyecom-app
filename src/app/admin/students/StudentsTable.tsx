"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Instagram as InstagramIcon } from "lucide-react";
import { Input, Table, THead, TBody, TR, TH, TD, Badge, EmptyState } from "@/components/ui";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  instagram_username: string | null;
  instagram_connected: boolean;
  followers: number | null;
  revenue: number;
  profit: number;
  created_at: string;
}

export function StudentsTable({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.instagram_username ?? "").toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          placeholder="Buscar por nombre, correo o usuario..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!filtered.length ? (
        <EmptyState
          title="Sin resultados"
          description="No hay estudiantes que coincidan con tu búsqueda."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Estudiante</TH>
              <TH>Instagram</TH>
              <TH className="text-right">Seguidores</TH>
              <TH className="text-right">Vendido</TH>
              <TH className="text-right">Ganancia</TH>
              <TH>Registrado</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((s) => (
              <TR key={s.id}>
                <TD>
                  <Link href={`/admin/students/${s.id}`} className="block">
                    <span className="font-medium text-ink-primary hover:text-brand-green-deep">
                      {s.full_name || "Sin nombre"}
                    </span>
                    <span className="block text-xs text-ink-muted">{s.email}</span>
                  </Link>
                </TD>
                <TD>
                  {s.instagram_connected ? (
                    <Badge variant="good">
                      <InstagramIcon size={12} />
                      {s.instagram_username ? `@${s.instagram_username}` : "Conectado"}
                    </Badge>
                  ) : (
                    <Badge variant="muted">Sin datos</Badge>
                  )}
                </TD>
                <TD className="text-right tabular">
                  {s.followers != null ? formatNumber(s.followers) : "—"}
                </TD>
                <TD className="text-right tabular">{formatCurrency(s.revenue)}</TD>
                <TD className="text-right tabular">{formatCurrency(s.profit)}</TD>
                <TD className="text-ink-muted text-xs whitespace-nowrap">
                  {formatDate(s.created_at)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
