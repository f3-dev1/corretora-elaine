import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { get, put } from "@vercel/blob";
import seed from "@/data/catalogo.json";
import type { Imovel } from "./tipos";

const ARQUIVO = "data/imoveis.json";
export const TAG = "imoveis";
export const temBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function lerDoBlob(): Promise<Imovel[] | null> {
  const r = await get(ARQUIVO, { access: "public", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse(await new Response(r.stream).text()) as Imovel[];
}

/** Todos os imóveis (inclusive rascunhos). Fica em cache até o painel salvar algo. */
export async function todosImoveis(): Promise<Imovel[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAG);
  if (temBlob()) {
    try {
      const lista = await lerDoBlob();
      if (lista) return lista;
    } catch (e) {
      // o site público continua no ar com o catálogo importado se o Blob falhar
      console.error("Falha ao ler imóveis do Blob; usando o catálogo importado.", e);
    }
  }
  return seed as Imovel[];
}

/** Leitura sem cache, na hora do acesso, para o painel editar sempre a versão mais nova. */
export async function todosImoveisFresco(): Promise<Imovel[]> {
  await connection();
  if (temBlob()) return (await lerDoBlob()) ?? (seed as Imovel[]);
  return seed as Imovel[];
}

export async function salvarImoveis(lista: Imovel[]) {
  if (!temBlob()) throw new Error("Armazenamento não configurado (BLOB_READ_WRITE_TOKEN ausente).");
  await put(ARQUIVO, JSON.stringify(lista), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function imovelPorSlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAG);
  const lista = await todosImoveis();
  return lista.find((im) => im.slug === slug) ?? null;
}
