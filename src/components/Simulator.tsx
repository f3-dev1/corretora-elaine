"use client";

import { useId, useMemo, useState } from "react";
import { whatsappUrl } from "@/data/site";
import { WhatsAppIcon } from "./icons";

// Taxa de referência (efetiva ao ano) usada só para a estimativa. Ajuste aqui quando os bancos mudarem.
const TAXA_ANO = 0.095;
const LIMITE_RENDA = 0.3; // bancos costumam limitar a parcela a 30% da renda

const VALOR = { min: 120_000, max: 1_500_000, step: 5_000 };
const PRAZO = { min: 120, max: 420, step: 12 };

const brl = (v: number, dec = 2) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: dec, maximumFractionDigits: dec });
const num = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const digits = (s: string) => Number(s.replace(/\D/g, "")) || 0;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function Field({
  label, hint, value, min, max, step, onChange, prefix, suffix, display, minLabel, maxLabel, tone,
  parse = (n: number) => n,
}: {
  label: string; hint?: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; prefix?: string; suffix?: string; display: string;
  minLabel: string; maxLabel: string; tone?: "gold"; parse?: (typed: number) => number;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="sim-field">
      <div className="sim-row">
        <label htmlFor={id}>
          {label} {hint && <span className="sim-hint">{hint}</span>}
        </label>
        <div className={`sim-box${tone ? " gold" : ""}`}>
          {prefix && <span>{prefix}</span>}
          <input
            id={id}
            inputMode="numeric"
            value={draft ?? display}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { if (draft !== null) onChange(clamp(parse(digits(draft)), min, max)); setDraft(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          />
          {suffix && <span className="suf">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        className="sim-range"
        aria-label={label}
        min={min} max={max} step={step} value={value}
        style={{ "--p": `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="sim-ends mono"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

export default function Simulator() {
  const [valor, setValor] = useState(450_000);
  const [entradaPct, setEntradaPct] = useState(20);
  const [prazo, setPrazo] = useState(360);

  const entrada = Math.round((valor * entradaPct) / 100);
  const r = useMemo(() => {
    const financiado = valor - entrada;
    const i = Math.pow(1 + TAXA_ANO, 1 / 12) - 1;
    const amort = financiado / prazo;
    const primeira = amort + financiado * i;
    const ultima = amort + amort * i;
    return { financiado, primeira, ultima, renda: primeira / LIMITE_RENDA };
  }, [valor, entrada, prazo]);

  const anos = prazo / 12;
  const msg =
    `Olá, Elaine! Fiz uma simulação no site e quero uma avaliação de crédito.\n` +
    `Imóvel: ${brl(valor, 0)}\nEntrada: ${brl(entrada, 0)} (${entradaPct}%)\nPrazo: ${prazo} meses\n` +
    `1ª parcela estimada: ${brl(r.primeira)}`;

  return (
    <section className="sim gutter" id="simulador" aria-labelledby="sim-title">
      <div className="inner sim-grid">
        <div className="sim-form">
          <span className="lbl mono">Planejamento</span>
          <h2 id="sim-title" className="split"><span className="line"><span>Simule o seu financiamento</span></span></h2>
          <p className="sim-lead up">Ajuste os valores e veja uma estimativa da entrada e da primeira parcela no sistema bancário.</p>

          <Field
            label="Valor do imóvel" value={valor} {...VALOR} onChange={setValor}
            prefix="R$" display={num(valor)} minLabel="R$ 120 mil" maxLabel="R$ 1,5 milhão"
          />
          <Field
            label="Entrada" hint={`${entradaPct}%`} value={entradaPct} min={20} max={80} step={1}
            onChange={setEntradaPct} prefix="R$" display={num(entrada)} tone="gold"
            parse={(reais) => Math.round((reais / valor) * 100)}
            minLabel="Mínimo 20%" maxLabel="Até 80%"
          />
          <Field
            label="Prazo" value={prazo} {...PRAZO} onChange={setPrazo}
            display={String(prazo)} suffix={`meses · ${anos} anos`} minLabel="10 anos" maxLabel="35 anos"
          />
        </div>

        <aside className="sim-card">
          <span className="mono sim-k">Estimativa de crédito</span>
          <h3>Primeira parcela mensal aproximada</h3>
          <dl>
            <div><dt>Valor financiado</dt><dd>{brl(r.financiado)}</dd></div>
            <div><dt>Entrada</dt><dd className="g">{brl(entrada)}</dd></div>
            <div><dt>Taxa de referência</dt><dd className="soft">~{(TAXA_ANO * 100).toLocaleString("pt-BR")}% a.a. · SAC</dd></div>
          </dl>
          <div className="sim-big">
            <span className="mono">1ª parcela</span>
            <strong aria-live="polite">{brl(r.primeira)}</strong>
            <span className="sim-sub">caindo até {brl(r.ultima)} na última</span>
          </div>
          <p className="sim-renda">Renda familiar sugerida: <b>a partir de {brl(r.renda, 0)}</b> por mês</p>
          <a className="sim-cta" href={whatsappUrl(msg)} target="_blank" rel="noopener">
            <WhatsAppIcon size={19} /> Pedir avaliação de crédito
          </a>
          <p className="sim-note">Estimativa sem seguros e taxas. Parcelas decrescentes (SAC). O valor final depende da análise do banco.</p>
        </aside>
      </div>
    </section>
  );
}
