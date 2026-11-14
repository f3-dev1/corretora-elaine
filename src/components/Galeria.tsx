"use client";

import { useCallback, useEffect, useState } from "react";

export default function Galeria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
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

  if (!fotos.length) return <div className="gal gal-vazia mono">Fotos em breve</div>;
  const mostra = fotos.slice(0, 5);
  return (
    <>
      <div className={`gal gal-${Math.min(mostra.length, 5)}`}>
        {mostra.map((f, i) => (
          <button key={f} type="button" className="gal-i" onClick={() => setAberta(i)} aria-label={`Abrir foto ${i + 1} de ${fotos.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f} alt={i === 0 ? titulo : ""} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
            {i === mostra.length - 1 && fotos.length > mostra.length && <span className="gal-mais mono">+{fotos.length - mostra.length} fotos</span>}
          </button>
        ))}
        <button type="button" className="gal-todas mono" onClick={() => setAberta(0)}>Ver as {fotos.length} fotos</button>
      </div>
      {aberta != null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={`Fotos de ${titulo}`} onClick={fechar}>
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
