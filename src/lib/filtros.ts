import type { Imovel } from "./tipos";
import { visivel } from "./tipos";

export type Filtros = {
  finalidade?: string;
  tipo?: string;
  bairro?: string;
  min?: string;
  max?: string;
  quartos?: string;
  mar?: string;
  piscina?: string;
  financia?: string;
  q?: string;
  ordem?: string;
  p?: string;
};

export const POR_PAGINA = 24;

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const n = (v?: string) => (v ? Number(v) || 0 : 0);

export function filtrar(lista: Imovel[], f: Filtros) {
  const q = f.q ? norm(f.q) : "";
  let r = lista.filter(visivel).filter((im) => {
    if (f.finalidade && im.finalidade !== f.finalidade) return false;
    if (f.tipo && im.tipo !== f.tipo) return false;
    if (f.bairro && im.bairro !== f.bairro) return false;
    if (n(f.min) && (im.preco ?? 0) < n(f.min)) return false;
    if (n(f.max) && (im.preco == null || im.preco > n(f.max))) return false;
    if (n(f.quartos) && (im.quartos ?? 0) < n(f.quartos)) return false;
    if (n(f.mar) && (im.distanciaMar == null || im.distanciaMar > n(f.mar))) return false;
    if (f.piscina && !im.piscina) return false;
    if (f.financia && !im.financiamento) return false;
    if (q && !norm(`${im.titulo} ${im.bairro ?? ""} ${im.descricao} ${im.id}`).includes(q)) return false;
    return true;
  });
  // vendidos/alugados vão para o fim
  const peso = (im: Imovel) => (im.status === "publicado" ? 0 : 1);
  if (f.ordem === "menor") r = r.sort((a, b) => peso(a) - peso(b) || (a.preco ?? Infinity) - (b.preco ?? Infinity));
  else if (f.ordem === "maior") r = r.sort((a, b) => peso(a) - peso(b) || (b.preco ?? 0) - (a.preco ?? 0));
  else {
    // padrão: destaques, depois os mais recentes do painel, depois os importados misturados (ordem estável)
    const completo = (im: Imovel) => (im.fotos.length ? 0 : 2) + (im.preco ? 0 : 1);
    const mistura = (im: Imovel) => [...im.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    r = r.sort((a, b) =>
      peso(a) - peso(b) ||
      Number(b.destaque) - Number(a.destaque) ||
      (b.criadoEm ?? "").localeCompare(a.criadoEm ?? "") ||
      completo(a) - completo(b) ||
      mistura(a) - mistura(b));
  }
  const total = r.length;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, n(f.p) || 1));
  return { itens: r.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA), total, pagina, paginas };
}

export function opcoes(lista: Imovel[]) {
  const vis = lista.filter(visivel);
  const conta = (k: (im: Imovel) => string | null) => {
    const m = new Map<string, number>();
    vis.forEach((im) => { const v = k(im); if (v) m.set(v, (m.get(v) ?? 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  return { tipos: conta((im) => im.tipo), bairros: conta((im) => im.bairro).sort((a, b) => a[0].localeCompare(b[0], "pt-BR")) };
}
