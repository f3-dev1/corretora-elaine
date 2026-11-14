"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Galeria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const [atual, setAtual] = useState(0);
  const faixa = useRef<HTMLDivElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const fechar = useCallback(() => setAberta(null), []);
  const ir = useCallback((d: number) => setAberta((i) => (i == null ? i : (i + d + fotos.length) % fotos.length)), [fotos.length]);

  useEffect(() => {
    if (aberta == null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; };
  }, [aberta, fechar, ir]);

  // contador da faixa do celular conforme o dedo desliza
  const aoRolar = () => {
    const el = faixa.current;
    if (el) setAtual(Math.round(el.scrollLeft / el.clientWidth));
  };

  // arrastar para os lados na tela cheia
  const inicio = (e: React.TouchEvent) => { const t = e.touches[0]; toque.current = { x: t.clientX, y: t.clientY }; };
  const fim = (e: React.TouchEvent) => {
    const s = toque.current;
    toque.current = null;
    if (!s) return;
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
          <button key={f + i} type="button" className="gal-i" onClick={() => setAberta(i)} aria-label={`Abrir foto ${i + 1} de ${fotos.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f} alt={i === 0 ? titulo : ""} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
            {i === mostra.length - 1 && fotos.length > mostra.length && <span className="gal-mais mono">+{fotos.length - mostra.length} fotos</span>}
          </button>
        ))}
        <button type="button" className="gal-todas mono" onClick={() => setAberta(0)}>Ver as {fotos.length} fotos</button>
      </div>

      {/* celular: todas as fotos numa faixa que desliza com o dedo */}
      <div className="gal-m" aria-roledescription="carrossel" aria-label={`Fotos de ${titulo}`}>
        <div className="gal-m-track" ref={faixa} onScroll={aoRolar}>
          {fotos.map((f, i) => (
            <button key={f + i} type="button" className="gal-m-i" onClick={() => setAberta(i)} aria-label={`Foto ${i + 1} de ${fotos.length}, abrir em tela cheia`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f} alt={i === 0 ? titulo : ""} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
            </button>
          ))}
        </div>
        <span className="gal-m-n mono" aria-live="polite">{atual + 1} / {fotos.length}</span>
      </div>

      {aberta != null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={`Fotos de ${titulo}`} onClick={fechar} onTouchStart={inicio} onTouchEnd={fim}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[aberta]} alt={`${titulo}, foto ${aberta + 1}`} onClick={(e) => e.stopPropagation()} />
          <span className="lb-n mono">{aberta + 1} / {fotos.length}</span>
          <button type="button" className="lb-x" onClick={fechar} aria-label="Fechar">✕</button>
          <button type="button" className="lb-a lb-p" onClick={(e) => { e.stopPropagation(); ir(-1); }} aria-label="Foto anterior">‹</button>
          <button type="button" className="lb-a lb-nx" onClick={(e) => { e.stopPropagation(); ir(1); }} aria-label="Próxima foto">›</button>
        </div>
      )}
    </>
  );
}
