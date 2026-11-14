"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { site, whatsappUrl } from "@/data/site";
import { WhatsAppIcon } from "./icons";

const OPTS = ["Comprar", "Alugar"] as const;

export default function SearchBar() {
  const [mode, setMode] = useState<(typeof OPTS)[number]>("Comprar");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ x: 0, w: 0 });

  useLayoutEffect(() => {
    const place = () => {
      const b = refs.current[OPTS.indexOf(mode)];
      if (b) setPill({ x: b.offsetLeft, w: b.offsetWidth });
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [mode]);

  return (
    <nav className="bar away" id="bar" aria-label="Busca rápida">
      <div className="seg" role="group" aria-label="Finalidade">
        <span className="pill" aria-hidden="true" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
        {OPTS.map((o, i) => (
          <button key={o} ref={(el) => { refs.current[i] = el; }} type="button" aria-pressed={mode === o} onClick={() => setMode(o)}>
            {o}
          </button>
        ))}
      </div>
      <a className="go" href="#imoveis">
        <span>Buscar imóveis</span>
        <span className="arrow">{site.catalogCount} →</span>
      </a>
      <a className="wa" href={whatsappUrl(`Olá, Elaine! Quero ${mode.toLowerCase()} um imóvel em Itanhaém.`)} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <WhatsAppIcon size={19} />
      </a>
    </nav>
  );
}
