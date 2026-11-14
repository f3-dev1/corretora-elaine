import "server-only";
import { createHash } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { del, list, put } from "@vercel/blob";
import seed from "@/data/catalogo.json";
import { logado } from "./auth";
import type { Imovel } from "./tipos";

export const TAG = "imoveis";
export const temBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/*
 * Cada salvamento grava uma versão nova (nome único), numa pasta de nome secreto.
 * Nome único = nenhum cache de CDN devolve dado velho; pasta secreta = ninguém adivinha o endereço.
 */
const pasta = () => {
  const s = process.env.SESSION_SECRET || "dev";
  return `data/${createHash("sha256").update(`catalogo:${s}`).digest("hex").slice(0, 24)}/`;
};

type Versao = { lista: Imovel[]; pathname: string | null };

async function versoes() {
  const { blobs } = await list({ prefix: pasta(), limit: 1000 });
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

async function lerUltima(): Promise<Versao> {
  const [ultima] = await versoes();
  if (!ultima) return { lista: seed as Imovel[], pathname: null };
  const r = await fetch(ultima.url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Não foi possível ler os imóveis (${r.status}).`);
  return { lista: (await r.json()) as Imovel[], pathname: ultima.pathname };
}

/** Todos os imóveis (inclusive rascunhos), para o site público. Fica em cache até o painel salvar. */
export async function todosImoveis(): Promise<Imovel[]> {
  "use cache: remote";
  cacheTag(TAG);
  if (temBlob()) {
    try {
      const { lista } = await lerUltima();
      cacheLife("max");
      return lista;
    } catch (e) {
      // o site público continua no ar com o catálogo importado; tenta o Blob de novo em minutos
      console.error("Falha ao ler imóveis do Blob; usando o catálogo importado.", e);
      cacheLife("minutes");
      return seed as Imovel[];
    }
  }
  cacheLife("max");
  return seed as Imovel[];
}

/** Leitura do painel: exige login e lê sempre a versão mais nova, na hora do acesso. */
export async function imoveisDoPainel(): Promise<Imovel[]> {
  await connection();
  if (!(await logado())) redirect("/painel/login");
  if (!temBlob()) return seed as Imovel[];
  return (await lerUltima()).lista;
}

/**
 * Aplica `mudar` sobre a versão mais nova e grava. Se outra gravação entrou no meio,
 * reaplica a mesma mudança sobre ela (até 3 vezes), para nenhuma alteração se perder.
 */
export async function gravarImoveis(mudar: (lista: Imovel[]) => Imovel[]) {
  if (!temBlob()) throw new Error("O armazenamento ainda não está ligado neste ambiente.");
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const atual = await lerUltima();
    const nova = mudar(structuredClone(atual.lista));
    const [topo] = await versoes();
    if ((topo?.pathname ?? null) !== atual.pathname) continue; // alguém salvou no meio: refaz
    const nome = `${pasta()}imoveis-${Date.now().toString().padStart(15, "0")}.json`;
    await put(nome, JSON.stringify(nova), { access: "public", addRandomSuffix: false, contentType: "application/json" });
    // guarda as 10 versões mais recentes (servem de histórico) e apaga o resto
    const antigas = (await versoes()).slice(10).map((b) => b.url);
    if (antigas.length) await del(antigas).catch(() => {});
    return nova;
  }
  throw new Error("Outra alteração estava sendo salva ao mesmo tempo. Tente de novo.");
}

export async function imovelPorSlug(slug: string) {
  "use cache: remote";
  cacheLife("max");
  cacheTag(TAG);
  const lista = await todosImoveis();
  return lista.find((im) => im.slug === slug) ?? null;
}
