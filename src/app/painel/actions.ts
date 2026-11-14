"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { criarSessao, encerrarSessao, logado, senhaConfere } from "@/lib/auth";
import { salvarImoveis, TAG, temBlob, todosImoveisFresco } from "@/lib/catalogo";
import { slugify, type Imovel, type Status } from "@/lib/tipos";

export type Resultado = { ok: boolean; erro?: string };

async function exigirLogin() {
  if (!(await logado())) redirect("/painel/login");
}

export async function entrar(_: Resultado | null, fd: FormData): Promise<Resultado> {
  const senha = String(fd.get("senha") ?? "");
  if (!senhaConfere(senha)) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: false, erro: "Senha incorreta. Confira e tente de novo." };
  }
  await criarSessao();
  redirect("/painel");
}

export async function sair() {
  await encerrarSessao();
  redirect("/painel/login");
}

async function gravar(mudar: (lista: Imovel[]) => Imovel[]) {
  if (!temBlob()) throw new Error("O armazenamento ainda não está ligado neste ambiente.");
  const lista = await todosImoveisFresco();
  await salvarImoveis(mudar(lista));
  updateTag(TAG);
}

// Aceita número ou texto digitado em formato brasileiro ("1.500.000", "441,5") ou simples ("440.7").
const num = (v: unknown) => {
  if (v === "" || v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).trim();
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function salvarImovel(dados: Partial<Imovel> & { id?: string }): Promise<Resultado & { slug?: string }> {
  await exigirLogin();
  const titulo = String(dados.titulo ?? "").trim();
  if (titulo.length < 5) return { ok: false, erro: "Escreva um título com pelo menos 5 letras." };
  const agora = new Date().toISOString();
  let slugFinal = "";
  try {
    await gravar((lista) => {
      const antigo = dados.id ? lista.find((x) => x.id === dados.id) : undefined;
      const id = antigo?.id ?? Math.random().toString(36).slice(2, 8);
      const slug = antigo?.slug ?? `${slugify(`${titulo} ${dados.bairro ?? ""}`)}-${id}`;
      slugFinal = slug;
      const im: Imovel = {
        ...(antigo ?? {}),
        id,
        slug,
        titulo,
        tipo: String(dados.tipo || "Casa"),
        finalidade: dados.finalidade === "aluguel" ? "aluguel" : "venda",
        status: (["publicado", "rascunho", "vendido", "alugado"].includes(String(dados.status)) ? dados.status : "rascunho") as Status,
        destaque: Boolean(dados.destaque),
        preco: num(dados.preco),
        condominio: num(dados.condominio),
        iptu: num(dados.iptu),
        bairro: String(dados.bairro ?? "").trim() || null,
        cidade: String(dados.cidade ?? "").trim() || "Itanhaém",
        endereco: String(dados.endereco ?? "").trim() || null,
        mapaExato: Boolean(dados.mapaExato),
        quartos: num(dados.quartos),
        suites: num(dados.suites),
        banheiros: num(dados.banheiros),
        vagas: num(dados.vagas),
        area: num(dados.area),
        areaTerreno: num(dados.areaTerreno),
        distanciaMar: num(dados.distanciaMar),
        lado: dados.lado === "praia" || dados.lado === "serra" ? dados.lado : null,
        piscina: Boolean(dados.piscina),
        financiamento: Boolean(dados.financiamento),
        permuta: Boolean(dados.permuta),
        caracteristicas: (dados.caracteristicas ?? []).map((c) => String(c).trim()).filter(Boolean).slice(0, 40),
        descricao: String(dados.descricao ?? "").trim(),
        fotos: (dados.fotos ?? []).filter((f) => typeof f === "string" && f.startsWith("https://")).slice(0, 60),
        revisar: undefined,
        criadoEm: antigo?.criadoEm ?? agora,
        atualizadoEm: agora,
      };
      return antigo ? lista.map((x) => (x.id === id ? im : x)) : [im, ...lista];
    });
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Não foi possível salvar." };
  }
  return { ok: true, slug: slugFinal };
}

export async function acaoRapida(id: string, acao: { status?: Status; destaque?: boolean; excluir?: boolean }): Promise<Resultado> {
  await exigirLogin();
  try {
    await gravar((lista) => {
      if (acao.excluir) return lista.filter((x) => x.id !== id);
      return lista.map((x) =>
        x.id === id
          ? { ...x, ...(acao.status ? { status: acao.status } : {}), ...(acao.destaque != null ? { destaque: acao.destaque } : {}), atualizadoEm: new Date().toISOString() }
          : x,
      );
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Não foi possível salvar." };
  }
}
