import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { todosImoveis } from "@/lib/catalogo";
import { visivel } from "@/lib/tipos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lista = (await todosImoveis()).filter(visivel);
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/imoveis`, changeFrequency: "daily", priority: 0.9 },
    ...lista.map((im) => ({
      url: `${site.url}/imovel/${im.slug}`,
      lastModified: im.atualizadoEm,
      changeFrequency: "weekly" as const,
      priority: im.status === "publicado" ? 0.7 : 0.3,
    })),
  ];
}
