"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const esconder = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = "hidden"; };

export default function Galeria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const [atual, setAtual] = useState(0);
  const faixa = useRef<HTMLDivElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const botaoFechar = useRef<HTMLButtonElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  const ultima = useRef(0);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const varias = fotos.length > 1;
  const estaAberta = aberta != null;

  const ir = useCallback((d: number) => setAberta((i) => (i == null ? i : (i + d + fotos.length) % fotos.length)), [fotos.length]);
  const fechar = useCallback(() => {
    // se a tela cheia empilhou um passo no histórico, volta nele (o popstate fecha)
    if (history.state?.galeria) history.back();
    else setAberta(null);
  }, []);
  const abrir = (i: number) => {
    origem.current = document.activeElement as HTMLElement;
    history.pushState({ ...history.state, galeria: 1 }, "");
    setAberta(i);
  };

  useEffect(() => { if (aberta != null) ultima.current = aberta; }, [aberta]);

  // abre: foco no botão de fechar, trava a rolagem, "voltar" do celular fecha; fecha: devolve o foco
  useEffect(() => {
    if (!estaAberta) return;
    botaoFechar.current?.focus();
    const el = faixa.current;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const pop = () => setAberta(null);
    addEventListener("popstate", pop);
    return () => {
      html.style.overflow = "";
      removeEventListener("popstate", pop);
      origem.current?.focus?.({ preventScroll: true });
      // a faixa do celular para na última foto vista
      if (el) el.scrollTo({ left: ultima.current * el.clientWidth, behavior: "instant" as ScrollBehavior });
    };
  }, [estaAberta]);

  useEffect(() => {
    if (!estaAberta) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (varias && e.key === "ArrowRight") ir(1);
      if (varias && e.key === "ArrowLeft") ir(-1);
      if (e.key === "Tab") {
        const bts = [...(caixa.current?.querySelectorAll<HTMLElement>("button") ?? [])];
        if (!bts.length) return;
        e.preventDefault();
        const i = bts.indexOf(document.activeElement as HTMLElement);
        bts[(i + (e.shiftKey ? -1 : 1) + bts.length) % bts.length].focus();
      }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [estaAberta, fechar, ir, varias]);

  const aoRolar = () => {
    const el = faixa.current;
    if (el) setAtual(Math.round(el.scrollLeft / el.clientWidth));
  };

  // arrastar para os lados na tela cheia (ignora pinça e tela ampliada)
  const inicio = (e: React.TouchEvent) => {
    if (e.touches.length > 1) { toque.current = null; return; }
    const t = e.touches[0];
    toque.current = { x: t.clientX, y: t.clientY };
  };
  const fim = (e: React.TouchEvent) => {
    const s = toque.current;
    toque.current = null;
    if (!s || !varias || e.touches.length > 0 || (window.visualViewport?.scale ?? 1) > 1.01) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(t.clientY - s.y)) ir(dx < 0 ? 1 : -1);
  };

  if (!fotos.length) return <div className="gal gal-vazia mono">Fotos em breve</div>;
  const mostra = fotos.slice(0, 5);
  return (
    <>
      <div className={`gal gal-${Math.min(mostra.length, 5)}`}>
        {mostra.map((f, i) => (
          <button key={f + i} type="button" className="gal-i" onClick={() => abrir(i)} aria-label={`Abrir foto ${i + 1} de ${fotos.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f} alt={i === 0 ? titulo : ""} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} onError={esconder} />
            {i === mostra.length - 1 && fotos.length > mostra.length && <span className="gal-mais mono">+{fotos.length - mostra.length} fotos</span>}
          </button>
        ))}
        <button type="button" className="gal-todas mono" onClick={() => abrir(0)}>Ver as {fotos.length} fotos</button>
      </div>

      {/* celular: todas as fotos numa faixa que desliza com o dedo */}
      <div className="gal-m" role="region" aria-roledescription="carrossel" aria-label={`Fotos de ${titulo}`}>
        <div className="gal-m-track" ref={faixa} onScroll={aoRolar}>
          {fotos.map((f, i) => (
            <button key={f + i} type="button" className="gal-m-i" onClick={() => abrir(i)} aria-label={`Foto ${i + 1} de ${fotos.length}, abrir em tela cheia`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f} alt={i === 0 ? titulo : ""} loading={i < 2 ? "eager" : "lazy"} decoding="async" onError={esconder} />
            </button>
          ))}
        </div>
        {varias && <span className="gal-m-n mono">{atual + 1} / {fotos.length}</span>}
      </div>

      {aberta != null && (
        <div ref={caixa} className="lb" role="dialog" aria-modal="true" aria-label={`Fotos de ${titulo}`} onClick={fechar} onTouchStart={inicio} onTouchEnd={fim}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[aberta]} alt={`${titulo}, foto ${aberta + 1}`} onClick={(e) => e.stopPropagation()} />
          <span className="lb-n mono" aria-live="polite">{aberta + 1} / {fotos.length}</span>
          <button ref={botaoFechar} type="button" className="lb-x" onClick={(e) => { e.stopPropagation(); fechar(); }} aria-label="Fechar">✕</button>
          {varias && (
            <>
              <button type="button" className="lb-a lb-p" onClick={(e) => { e.stopPropagation(); ir(-1); }} aria-label="Foto anterior">‹</button>
              <button type="button" className="lb-a lb-nx" onClick={(e) => { e.stopPropagation(); ir(1); }} aria-label="Próxima foto">›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
