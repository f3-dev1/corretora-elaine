"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

type Opc = [string, number][];

const PRECOS = [150000, 250000, 350000, 500000, 750000, 1000000, 1500000];
const ALUGUEL = [1500, 2500, 3500, 5000, 8000];

export default function FiltroForm({ tipos, bairros }: { tipos: Opc; bairros: Opc }) {
  const router = useRouter();
  const sp = useSearchParams();
  const form = useRef<HTMLFormElement>(null);
  const [pend, start] = useTransition();
  const v = (k: string) => sp.get(k) ?? "";
  const aluguel = v("finalidade") === "aluguel";
  const faixas = aluguel ? ALUGUEL : PRECOS;

  const aplicar = () => {
    const fd = new FormData(form.current!);
    const q = new URLSearchParams();
    fd.forEach((val, key) => { if (val) q.set(key, String(val)); });
    start(() => router.push(`/imoveis${q.size ? `?${q}` : ""}`, { scroll: false }));
  };

  return (
    <form ref={form} className={`filtros${pend ? " busy" : ""}`} onChange={aplicar} onSubmit={(e) => { e.preventDefault(); aplicar(); }} aria-label="Filtrar imóveis">
      <div className="seg-f" role="radiogroup" aria-label="Finalidade">
        {[["", "Todos"], ["venda", "Comprar"], ["aluguel", "Alugar"]].map(([val, lab]) => (
          <label key={val}><input type="radio" name="finalidade" value={val} defaultChecked={v("finalidade") === val} /><span>{lab}</span></label>
        ))}
      </div>
      <label className="fx fx-q"><span className="mono">Buscar</span><input name="q" type="search" placeholder="Bairro, código ou palavra" defaultValue={v("q")} onChange={(e) => e.stopPropagation()} onBlur={aplicar} /></label>
      <label className="fx"><span className="mono">Tipo</span>
        <select name="tipo" defaultValue={v("tipo")}><option value="">Todos</option>{tipos.map(([t, c]) => <option key={t} value={t}>{t} ({c})</option>)}</select>
      </label>
      <label className="fx"><span className="mono">Bairro</span>
        <select name="bairro" defaultValue={v("bairro")}><option value="">Todos</option>{bairros.map(([b, c]) => <option key={b} value={b}>{b} ({c})</option>)}</select>
      </label>
      <label className="fx"><span className="mono">Até</span>
        <select name="max" defaultValue={v("max")} key={`max-${aluguel}`}><option value="">Qualquer valor</option>{faixas.map((p) => <option key={p} value={p}>{p.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</option>)}</select>
      </label>
      <label className="fx"><span className="mono">Quartos</span>
        <select name="quartos" defaultValue={v("quartos")}><option value="">Qualquer</option>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>{q}+</option>)}</select>
      </label>
      <label className="fx"><span className="mono">Do mar</span>
        <select name="mar" defaultValue={v("mar")}><option value="">Qualquer distância</option><option value="500">Até 500 m</option><option value="1000">Até 1 km</option><option value="2000">Até 2 km</option></select>
      </label>
      <div className="chips">
        <label className="chip"><input type="checkbox" name="piscina" value="1" defaultChecked={!!v("piscina")} /><span>Piscina</span></label>
        <label className="chip"><input type="checkbox" name="financia" value="1" defaultChecked={!!v("financia")} /><span>Aceita financiamento</span></label>
      </div>
      <label className="fx fx-o"><span className="mono">Ordenar</span>
        <select name="ordem" defaultValue={v("ordem")}><option value="">Destaques</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option></select>
      </label>
      {sp.size > 0 && <button type="button" className="limpar mono" onClick={() => { form.current?.reset(); start(() => router.push("/imoveis", { scroll: false })); }}>Limpar filtros</button>}
    </form>
  );
}
