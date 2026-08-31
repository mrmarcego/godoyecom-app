import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Godoyecom",
  description:
    "Plataforma de Godoyecom para estudiantes: crecimiento en Instagram y métricas del negocio de reventa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
