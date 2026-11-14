"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { salvarImovel } from "../../actions";
import { STATUS_LABEL, TIPOS, type Imovel, type Status } from "@/lib/tipos";

const SUGESTOES = ["Churrasqueira", "Área gourmet", "Edícula", "Quintal", "Jardim", "Suíte", "Varanda", "Garagem coberta", "Escritura", "Rua asfaltada", "Mobiliado", "Aceita pets", "Portão eletrônico", "Lago", "Pomar", "Poço artesiano"];

type Props = { inicial?: Imovel; bairros: string[] };

export default function ImovelForm({ inicial, bairros }: Props) {
  const router = useRouter();
  const [d, setD] = useState<Partial<Imovel>>(
    inicial ?? { tipo: "Casa", finalidade: "venda", status: "rascunho", cidade: "Itanhaém", fotos: [], caracteristicas: [], piscina: false, financiamento: true, permuta: false, destaque: false, mapaExato: false },
  );
  const [salvando, start] = useTransition();
  const [enviando, setEnviando] = useState<{ feito: number; total: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [nova, setNova] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const sujo = useRef(false);
  const lotesAtivos = useRef(0);
  const jaEnviados = useRef(new Set<string>());

  const set = <K extends keyof Imovel>(k: K, v: Imovel[K] | null) => { sujo.current = true; setD((x) => ({ ...x, [k]: v })); };
  const fotos = d.fotos ?? [];
  const carac = d.caracteristicas ?? [];

  // avisa antes de fechar a aba com alterações ou fotos ainda subindo
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (sujo.current || lotesAtivos.current > 0) e.preventDefault(); };
    addEventListener("beforeunload", h);
    return () => removeEventListener("beforeunload", h);
  }, []);

  const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  async function enviarArquivos(files: FileList | File[]) {
    const todos = Array.from(files);
    const lista = todos.filter((f) => TIPOS_FOTO.includes(f.type) && !jaEnviados.current.has(`${f.name}|${f.size}|${f.lastModified}`));
    const ignorados = todos.filter((f) => !TIPOS_FOTO.includes(f.type)).length;
    setErro(ignorados ? `${ignorados} arquivo(s) não são fotos JPG, PNG ou WebP e foram ignorados.` : null);
    if (!lista.length) return;
    sujo.current = true;
    lotesAtivos.current++;
    setEnviando((s) => ({ feito: s?.feito ?? 0, total: (s?.total ?? 0) + lista.length }));
    const urls: string[] = [];
    let falhas = 0;
    for (const f of lista) {
      try {
        const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const r = await upload(`imoveis/${d.id ?? "novo"}/${Date.now()}.${ext}`, f, { access: "public", handleUploadUrl: "/api/upload", contentType: f.type });
        urls.push(r.url);
        jaEnviados.current.add(`${f.name}|${f.size}|${f.lastModified}`);
      } catch {
        falhas++;
      }
      setEnviando((s) => (s ? { ...s, feito: s.feito + 1 } : s));
    }
    setD((x) => ({ ...x, fotos: [...(x.fotos ?? []), ...urls] }));
    if (falhas) setErro(`${falhas} de ${lista.length} fotos não subiram. Use JPG, PNG ou WebP de até 12 MB e tente de novo.`);
    if (--lotesAtivos.current === 0) setEnviando(null);
  }

  const mover = (i: number, dir: -1 | 1) => setD((x) => {
    const f = [...(x.fotos ?? [])];
    const j = i + dir;
    if (j < 0 || j >= f.length) return x;
    [f[i], f[j]] = [f[j], f[i]];
    return { ...x, fotos: f };
  });
  const capa = (i: number) => setD((x) => { const f = [...(x.fotos ?? [])]; const [it] = f.splice(i, 1); return { ...x, fotos: [it, ...f] }; });
  const remover = (i: number) => setD((x) => ({ ...x, fotos: (x.fotos ?? []).filter((_, k) => k !== i) }));
  const toggleCarac = (c: string) => set("caracteristicas", carac.includes(c) ? carac.filter((x) => x !== c) : [...carac, c]);

  function salvar(statusForcado?: Status) {
    setErro(null); setOk(null);
    const dados = { ...d, status: statusForcado ?? d.status };
    start(async () => {
      const r = await salvarImovel(dados);
      if (!r.ok) { setErro(r.erro ?? "Não foi possível salvar."); return; }
      sujo.current = false;
      setOk(dados.status === "publicado" ? "Salvo e publicado no site." : "Salvo.");
      if (!inicial) router.push("/painel");
      else if (r.imovel) setD(r.imovel); // mostra o que foi gravado de fato
    });
  }

  const n = (k: keyof Imovel) => (d[k] as number | null | undefined) ?? "";
  const numIn = (k: keyof Imovel, label: string, suf?: string) => (
    <label className="pf">
      <span>{label}</span>
      <div className="pf-suf">
        <input value={n(k)} onChange={(e) => set(k, (e.target.value.slice(0, 30) || null) as never)} />
        {suf && <em>{suf}</em>}
      </div>
    </label>
  );

  return (
    <form className="pf-form" onSubmit={(e) => { e.preventDefault(); salvar(); }}>
      {inicial?.revisar?.length ? <p className="pn-aviso">{inicial.revisar.join(" · ")}. Corrija o preço e salve.</p> : null}

      <section className="pf-card">
        <h2>Fotos</h2>
        <p className="pf-hint">Arraste as fotos para cá ou clique para escolher. A primeira é a capa. Até 12 MB cada.</p>
        <div
          className={`pf-drop${arrastando ? " on" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); enviarArquivos(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
        >
          {enviando ? `Enviando ${enviando.feito} de ${enviando.total}…` : "＋ Adicionar fotos"}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) enviarArquivos(e.target.files); e.target.value = ""; }} />
        </div>
        {fotos.length > 0 && (
          <ol className="pf-fotos">
            {fotos.map((f, i) => (
              <li key={f + i} className={i === 0 ? "capa" : ""}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f} alt={`Foto ${i + 1}`} loading="lazy" />
                {i === 0 && <span className="pf-capa">Capa</span>}
                <div className="pf-fa">
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda">‹</button>
                  {i > 0 && <button type="button" onClick={() => capa(i)} aria-label="Usar como capa">capa</button>}
                  <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} aria-label="Mover para a direita">›</button>
                  <button type="button" className="x" onClick={() => remover(i)} aria-label="Remover foto">✕</button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="pf-card">
        <h2>Informações</h2>
        <label className="pf full"><span>Título do anúncio</span>
          <input value={d.titulo ?? ""} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: Chácara com piscina a 900 m do mar" required minLength={5} />
        </label>
        <div className="pf-grid">
          <label className="pf"><span>Finalidade</span>
            <select value={d.finalidade} onChange={(e) => set("finalidade", e.target.value as Imovel["finalidade"])}><option value="venda">Venda</option><option value="aluguel">Aluguel mensal</option></select>
          </label>
          <label className="pf"><span>Tipo</span>
            <select value={d.tipo} onChange={(e) => set("tipo", e.target.value)}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          {numIn("preco", d.finalidade === "aluguel" ? "Aluguel por mês" : "Preço", "R$")}
          {numIn("condominio", "Condomínio", "R$")}
          {numIn("iptu", "IPTU", "R$")}
        </div>
      </section>

      <section className="pf-card">
        <h2>Localização</h2>
        <div className="pf-grid">
          <label className="pf"><span>Bairro</span>
            <input list="bairros" value={d.bairro ?? ""} onChange={(e) => set("bairro", e.target.value)} />
            <datalist id="bairros">{bairros.map((b) => <option key={b} value={b} />)}</datalist>
          </label>
          <label className="pf"><span>Cidade</span><input value={d.cidade ?? ""} onChange={(e) => set("cidade", e.target.value)} /></label>
          {numIn("distanciaMar", "Distância do mar", "m")}
          <label className="pf"><span>Lado</span>
            <select value={d.lado ?? ""} onChange={(e) => set("lado", (e.target.value || null) as Imovel["lado"])}><option value="">Não informar</option><option value="praia">Lado praia</option><option value="serra">Lado serra</option></select>
          </label>
          <label className="pf full"><span>Endereço (opcional)</span><input value={d.endereco ?? ""} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua e número" /></label>
        </div>
        <label className="pf-check"><input type="checkbox" checked={!!d.mapaExato} onChange={(e) => set("mapaExato", e.target.checked)} /> Mostrar o endereço exato no mapa (sem marcar, o mapa mostra só o bairro)</label>
      </section>

      <section className="pf-card">
        <h2>Ficha</h2>
        <div className="pf-grid">
          {numIn("quartos", "Quartos")}{numIn("suites", "Suítes")}{numIn("banheiros", "Banheiros")}{numIn("vagas", "Vagas")}
          {numIn("area", "Área construída", "m²")}{numIn("areaTerreno", "Terreno", "m²")}
        </div>
        <div className="pf-toggles">
          <label className="pf-check"><input type="checkbox" checked={!!d.piscina} onChange={(e) => set("piscina", e.target.checked)} /> Piscina</label>
          <label className="pf-check"><input type="checkbox" checked={!!d.financiamento} onChange={(e) => set("financiamento", e.target.checked)} /> Aceita financiamento</label>
          <label className="pf-check"><input type="checkbox" checked={!!d.permuta} onChange={(e) => set("permuta", e.target.checked)} /> Aceita permuta</label>
        </div>
        <span className="pf-lab">Características</span>
        <div className="pf-chips">
          {[...new Set([...SUGESTOES, ...carac])].map((c) => (
            <button type="button" key={c} className={carac.includes(c) ? "on" : ""} aria-pressed={carac.includes(c)} onClick={() => toggleCarac(c)}>{c}</button>
          ))}
        </div>
        <div className="pf-add">
          <input value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Outra característica" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (nova.trim()) { toggleCarac(nova.trim()); setNova(""); } } }} />
          <button type="button" onClick={() => { if (nova.trim()) { toggleCarac(nova.trim()); setNova(""); } }}>Adicionar</button>
        </div>
      </section>

      <section className="pf-card">
        <h2>Descrição</h2>
        <textarea rows={8} value={d.descricao ?? ""} onChange={(e) => set("descricao", e.target.value)} placeholder="Conte o que o imóvel tem de melhor, a documentação e as condições." />
      </section>

      <div className="pf-bar">
        <div className="pf-bar-l">
          <label className="pf-inline"><span>Situação</span>
            <select value={d.status} onChange={(e) => set("status", e.target.value as Status)}>{(Object.keys(STATUS_LABEL) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
          </label>
          <label className="pf-check"><input type="checkbox" checked={!!d.destaque} onChange={(e) => set("destaque", e.target.checked)} /> Destaque na página inicial</label>
        </div>
        <div className="pf-bar-r">
          {erro && <span className="pn-erro" role="alert">{erro}</span>}
          {ok && <span className="pn-ok" role="status">{ok}</span>}
          <Link href="/painel" className="pn-btn ghost" onClick={(e) => { if ((sujo.current || lotesAtivos.current > 0) && !window.confirm("Sair sem salvar as alterações?")) e.preventDefault(); }}>Voltar</Link>
          <button type="submit" className="pn-btn ghost" disabled={salvando || !!enviando}>{salvando ? "Salvando…" : "Salvar"}</button>
          {d.status !== "publicado" && <button type="button" className="pn-btn" disabled={salvando || !!enviando} onClick={() => salvar("publicado")}>Salvar e publicar</button>}
        </div>
      </div>
    </form>
  );
}
