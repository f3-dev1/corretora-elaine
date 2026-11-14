import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "zn_painel";
const DURACAO = 60 * 60 * 24 * 7; // 7 dias

const segredo = () => process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-local-secret");
const assinar = (dado: string) => createHmac("sha256", segredo()).update(dado).digest("base64url");
// a sessão também depende da senha: trocar PAINEL_SENHA desconecta quem estava logado
const assinarSessao = (exp: string) => assinar(`sessao:${exp}:${assinar(`senha:${process.env.PAINEL_SENHA ?? ""}`)}`);

function igual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function senhaConfere(digitada: string) {
  const certa = process.env.PAINEL_SENHA;
  if (!certa || !segredo()) return false;
  // compara os hashes para não vazar o tamanho da senha
  return igual(assinar(`senha:${digitada}`), assinar(`senha:${certa}`));
}

export function painelConfigurado() {
  return Boolean(process.env.PAINEL_SENHA && segredo());
}

export async function criarSessao() {
  const exp = Math.floor(Date.now() / 1000) + DURACAO;
  (await cookies()).set(COOKIE, `${exp}.${assinarSessao(String(exp))}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

export function sessaoValida(valor: string | undefined) {
  if (!valor || !segredo() || !process.env.PAINEL_SENHA) return false;
  const [exp, sig] = valor.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return igual(sig, assinarSessao(exp));
}

export async function logado() {
  return sessaoValida((await cookies()).get(COOKIE)?.value);
}
