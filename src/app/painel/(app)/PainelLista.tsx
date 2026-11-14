"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { acaoRapida } from "../actions";
import { brl, codigo, STATUS_LABEL, type Finalidade, type Status } from "@/lib/tipos";

export type Linha = {
  id: string; slug: string; titulo: string; bairro: string | null; tipo: string; preco: number | null;
  finalidade: Finalidade; status: Status; destaque: boolean; foto: string | null; nfotos: number;
  revisar: boolean; atualizadoEm: string | null;
};

const POR_PAG = 40;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function PainelLista({ linhas }: { linhas: Linha[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Status | "revisar" | "destaque">("");
  const [pag, setPag] = useState(1);
  const [pend, start] = useTransition();
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const t = norm(q);
    return linhas
      .filter((l) => (status === "revisar" ? l.revisar : status === "destaque" ? l.destaque : !status || l.status === status))
      .filter((l) => !t || norm(`${l.titulo} ${l.bairro ?? ""} ${l.id} ${codigo(l)}`).includes(t))
      .sort((a, b) => (b.atualizadoEm ?? "").localeCompare(a.atualizadoEm ?? ""));
  }, [linhas, q, status]);
  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAG));
  const pagina = Math.min(pag, paginas);
  const vis = filtradas.slice((pagina - 1) * POR_PAG, pagina * POR_PAG);

  const rodar = (id: string, a: Parameters<typeof acaoRapida>[1], texto: string) =>
    start(async () => {
      const r = await acaoRapida(id, a);
      setMsg(r.ok ? { tipo: "ok", texto } : { tipo: "erro", texto: r.erro ?? "Não foi possível salvar." });
      setExcluindo(null);
      if (r.ok) router.refresh();
    });

  return (
    <section className={`pn-lista${pend ? " busy" : ""}`}>
      <div className="pn-filtros">
        <input type="search" placeholder="Buscar por título, bairro ou código" value={q} onChange={(e) => { setQ(e.target.value); setPag(1); }} aria-label="Buscar imóveis" />
        <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPag(1); }} aria-label="Filtrar por situação">
          <option value="">Todas as situações</option>
          <option value="publicado">Publicados</option>
          <option value="rascunho">Rascunhos</option>
          <option value="vendido">Vendidos</option>
          <option value="alugado">Alugados</option>
          <option value="destaque">Em destaque</option>
          <option value="revisar">Para revisar</option>
        </select>
        <span className="pn-count">{filtradas.length.toLocaleString("pt-BR")} imóveis</span>
      </div>
      {msg && <p className={`pn-msg ${msg.tipo}`} role="status">{msg.texto}</p>}

      <ul className="pn-rows">
        {vis.map((l) => (
          <li key={l.id} className="pn-row">
            <Link href={`/painel/imovel/${l.id}`} className="pn-thumb" aria-label={`Editar ${l.titulo}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.foto ? <img src={l.foto} alt="" loading="lazy" /> : <span>sem foto</span>}
            </Link>
            <div className="pn-info">
              <Link href={`/painel/imovel/${l.id}`} className="pn-tit">{l.titulo}</Link>
              <span className="pn-sub">
                {codigo(l)} · {l.tipo}{l.bairro ? ` · ${l.bairro}` : ""} · {l.nfotos} fotos
                {l.revisar && <em className="pn-rev">revisar preço</em>}
              </span>
            </div>
            <span className="pn-preco">{brl(l.preco)}{l.finalidade === "aluguel" && l.preco ? "/mês" : ""}</span>
            <select
              className={`pn-status st-${l.status}`}
              value={l.status}
              aria-label="Situação"
              onChange={(e) => rodar(l.id, { status: e.target.value as Status }, `Situação alterada para ${STATUS_LABEL[e.target.value as Status]}.`)}
            >
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <button type="button" className={`pn-star${l.destaque ? " on" : ""}`} aria-pressed={l.destaque} title="Destaque na página inicial"
              onClick={() => rodar(l.id, { destaque: !l.destaque }, l.destaque ? "Tirado dos destaques." : "Colocado em destaque.")}>★</button>
            <div className="pn-acts">
              <Link href={`/painel/imovel/${l.id}`}>Editar</Link>
              <a href={`/imovel/${l.slug}`} target="_blank" rel="noopener">Ver</a>
              {excluindo === l.id ? (
                <span className="pn-conf">Excluir mesmo?
                  <button type="button" onClick={() => rodar(l.id, { excluir: true }, "Imóvel excluído.")}>Sim</button>
                  <button type="button" onClick={() => setExcluindo(null)}>Não</button>
                </span>
              ) : (
                <button type="button" className="pn-del" onClick={() => setExcluindo(l.id)}>Excluir</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {vis.length === 0 && <p className="pn-vazio">Nenhum imóvel encontrado com essa busca.</p>}
      {paginas > 1 && (
        <nav className="pn-pag" aria-label="Páginas">
          <button type="button" disabled={pagina === 1} onClick={() => setPag(pagina - 1)}>← Anterior</button>
          <span>Página {pagina} de {paginas}</span>
          <button type="button" disabled={pagina === paginas} onClick={() => setPag(pagina + 1)}>Próxima →</button>
        </nav>
      )}
    </section>
  );
}
