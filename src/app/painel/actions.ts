"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { criarSessao, encerrarSessao, logado, senhaConfere } from "@/lib/auth";
import { gravarImoveis, TAG } from "@/lib/catalogo";
import { num } from "@/lib/numeros";
import { slugify, TIPOS, type Imovel, type Status } from "@/lib/tipos";

export type Resultado = { ok: boolean; erro?: string };

const STATUS: Status[] = ["publicado", "rascunho", "vendido", "alugado"];
const ehStatus = (s: unknown): s is Status => STATUS.includes(s as Status);
const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

async function exigirLogin() {
  if (!(await logado())) redirect("/painel/login");
}

export async function entrar(_: Resultado | null, fd: FormData): Promise<Resultado> {
  const senha = String(fd.get("senha") ?? "").slice(0, 200);
  if (!senhaConfere(senha)) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: false, erro: "Senha incorreta. Confira e tente de novo." };
  }
  await criarSessao();
  redirect("/painel");
}

export async function sair() {
  await encerrarSessao();
  redirect("/painel/login");
}

const NUMEROS = {
  preco: "Preço", condominio: "Condomínio", iptu: "IPTU", quartos: "Quartos", suites: "Suítes", banheiros: "Banheiros",
  vagas: "Vagas", area: "Área construída", areaTerreno: "Terreno", distanciaMar: "Distância do mar",
} as const;

export async function salvarImovel(dados: Partial<Record<keyof Imovel, unknown>>): Promise<Resultado & { slug?: string; imovel?: Imovel }> {
  await exigirLogin();
  const titulo = texto(dados.titulo, 150);
  if (titulo.replace(/[^\p{L}\p{N}]/gu, "").length < 5) return { ok: false, erro: "Escreva um título com pelo menos 5 letras." };

  // números: recusa o que não deu para entender, em vez de salvar um valor errado
  for (const [k, nome] of Object.entries(NUMEROS)) {
    const v = dados[k as keyof Imovel];
    if (v !== "" && v != null && num(v) == null) return { ok: false, erro: `Confira o campo "${nome}": use só números, ex.: 1.500.000 ou 441,5.` };
    const n = num(v);
    if (n != null && n < 0) return { ok: false, erro: `O campo "${nome}" não pode ser negativo.` };
  }
  const preco = num(dados.preco);
  const finalidade = dados.finalidade === "aluguel" ? "aluguel" : "venda";
  if (finalidade === "venda" && preco != null && preco < 1000) return { ok: false, erro: "Preço de venda muito baixo. Escreva o valor completo, ex.: 300.000." };
  const status = ehStatus(dados.status) ? dados.status : "rascunho";
  const tipo = (TIPOS as readonly string[]).includes(String(dados.tipo)) ? String(dados.tipo) : "Casa";
  const lado = dados.lado === "praia" || dados.lado === "serra" ? dados.lado : null;
  const lista = (v: unknown) => (Array.isArray(v) ? v : []);
  const caracteristicas = [...new Set(lista(dados.caracteristicas).map((c) => texto(c, 80)).filter(Boolean))].slice(0, 40);
  const fotos = [...new Set(lista(dados.fotos).filter((f): f is string => typeof f === "string" && /^https:\/\/\S+$/.test(f) && f.length <= 600))].slice(0, 60);

  const agora = new Date().toISOString();
  let salvo: Imovel | undefined;
  try {
    await gravarImoveis((todos) => {
      const id0 = typeof dados.id === "string" ? dados.id : undefined;
      const antigo = id0 ? todos.find((x) => x.id === id0) : undefined;
      if (id0 && !antigo) throw new Error("Este imóvel não existe mais (pode ter sido excluído).");
      let id = antigo?.id;
      while (!id || (!antigo && todos.some((x) => x.id === id))) id = randomUUID().replace(/-/g, "").slice(0, 8);
      const bairro = texto(dados.bairro, 80) || null;
      const slug = antigo?.slug ?? `${slugify(`${titulo} ${bairro ?? ""}`) || "imovel"}-${id}`;
      const im: Imovel = {
        ...(antigo ?? {}),
        id, slug, titulo, tipo, finalidade, status, lado, caracteristicas, fotos, bairro, preco,
        destaque: Boolean(dados.destaque),
        condominio: num(dados.condominio),
        iptu: num(dados.iptu),
        cidade: texto(dados.cidade, 60) || "Itanhaém",
        endereco: texto(dados.endereco, 160) || null,
        mapaExato: Boolean(dados.mapaExato),
        quartos: num(dados.quartos),
        suites: num(dados.suites),
        banheiros: num(dados.banheiros),
        vagas: num(dados.vagas),
        area: num(dados.area),
        areaTerreno: num(dados.areaTerreno),
        distanciaMar: num(dados.distanciaMar),
        piscina: Boolean(dados.piscina),
        financiamento: Boolean(dados.financiamento),
        permuta: Boolean(dados.permuta),
        descricao: texto(dados.descricao, 10000),
        revisar: undefined,
        criadoEm: antigo?.criadoEm ?? agora,
        atualizadoEm: agora,
      };
      salvo = im;
      return antigo ? todos.map((x) => (x.id === id ? im : x)) : [im, ...todos];
    });
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Não foi possível salvar." };
  }
  updateTag(TAG);
  return { ok: true, slug: salvo?.slug, imovel: salvo };
}

export async function acaoRapida(id: string, acao: { status?: Status; destaque?: boolean; excluir?: boolean }): Promise<Resultado> {
  await exigirLogin();
  if (acao.status !== undefined && !ehStatus(acao.status)) return { ok: false, erro: "Situação inválida." };
  try {
    await gravarImoveis((lista) => {
      if (!lista.some((x) => x.id === id)) throw new Error("Este imóvel não existe mais.");
      if (acao.excluir) return lista.filter((x) => x.id !== id);
      return lista.map((x) =>
        x.id === id
          ? { ...x, ...(acao.status ? { status: acao.status } : {}), ...(typeof acao.destaque === "boolean" ? { destaque: acao.destaque } : {}), atualizadoEm: new Date().toISOString() }
          : x,
      );
    });
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Não foi possível salvar." };
  }
  updateTag(TAG);
  return { ok: true };
}
