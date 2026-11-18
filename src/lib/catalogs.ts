// Catálogos descargables que aparecen en la pestaña "Catálogos".
//
// Para actualizar un catálogo: reemplaza el PDF en /public/catalogos con el
// MISMO nombre de archivo y cambia `updatedAt` aquí. La fecha también se usa
// para que el navegador no muestre una versión vieja guardada en caché.
export interface Catalog {
  slug: string;
  title: string;
  description: string;
  file: string;
  updatedAt: string; // YYYY-MM-DD
}

export const CATALOGS: Catalog[] = [
  {
    slug: "perfumes",
    title: "Catálogo de perfumes",
    description: "Perfumes de diseñador con código CN. Los agotados vienen marcados como SOLD OUT.",
    file: "/catalogos/catalogo-perfumes.pdf",
    updatedAt: "2026-11-18",
  },
  {
    slug: "sudaderas",
    title: "Catálogo de sudaderas",
    description: "Essentials Fear of God y Alo.",
    file: "/catalogos/catalogo-sudaderas.pdf",
    updatedAt: "2026-11-18",
  },
];

export function catalogUrl(c: Catalog) {
  return `${c.file}?v=${c.updatedAt}`;
}
