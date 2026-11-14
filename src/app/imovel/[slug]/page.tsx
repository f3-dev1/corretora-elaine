import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import Galeria from "@/components/Galeria";
import ImovelCard from "@/components/ImovelCard";
import { WhatsAppIcon } from "@/components/icons";
import { imovelPorSlug, todosImoveis } from "@/lib/catalogo";
import { brl, codigo, distancia, visivel, type Imovel } from "@/lib/tipos";
import { site, whatsappUrl } from "@/data/site";

export async function generateStaticParams() {
  const lista = await todosImoveis();
  return lista.filter(visivel).slice(0, 12).map((im) => ({ slug: im.slug }));
}

export async function generateMetadata(props: PageProps<"/imovel/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const im = await imovelPorSlug(slug);
  if (!im || !visivel(im)) return { title: "Imóvel não encontrado | Zênite Imóveis", robots: { index: false } };
  const resumo = im.descricao.length > 130 ? `${im.descricao.slice(0, 130).replace(/\s+\S*$/, "")}…` : im.descricao;
  const local = [im.bairro, im.cidade].filter(Boolean).join(", ");
  const desc = `${im.tipo} ${im.finalidade === "aluguel" ? "para alugar" : "à venda"} em ${local}. ${brl(im.preco)}. ${resumo}`;
  const titulo = `${im.titulo} — ${brl(im.preco)} | Zênite Imóveis`;
  const img = im.fotos[0] ? [im.fotos[0]] : undefined;
  return {
    title: titulo,
    description: desc,
    alternates: { canonical: `/imovel/${im.slug}` },
    openGraph: { title: im.titulo, description: desc, url: `/imovel/${im.slug}`, images: img, locale: "pt_BR", type: "website" },
    twitter: { card: "summary_large_image", title: im.titulo, description: desc, images: img },
  };
}

export default function ImovelPage(props: PageProps<"/imovel/[slug]">) {
  return (
    <>
      <SiteHeader />
      <main className="det gutter">
        <Suspense fallback={<div className="inner det-skel" aria-hidden="true" />}>
          <Detalhe params={props.params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function Detalhe({ params }: Pick<PageProps<"/imovel/[slug]">, "params">) {
  const { slug } = await params;
  const im = await imovelPorSlug(slug);
  if (!im || !visivel(im)) notFound();
  const lista = await todosImoveis();
  const parecidos = lista
    .filter((o) => o.id !== im.id && o.status === "publicado" && o.finalidade === im.finalidade && (o.bairro === im.bairro || o.tipo === im.tipo))
    .slice(0, 3);
  const cod = codigo(im);
  const msg = `Olá, Elaine! Tenho interesse no imóvel "${im.titulo}" (${cod}), ${brl(im.preco)}. ${site.url}/imovel/${im.slug}`;
  const ficha: [string, string][] = (
    [
      ["Tipo", im.tipo],
      ["Quartos", im.quartos ? String(im.quartos) : null],
      ["Suítes", im.suites ? String(im.suites) : null],
      ["Banheiros", im.banheiros ? String(im.banheiros) : null],
      ["Vagas", im.vagas ? String(im.vagas) : null],
      ["Área construída", im.area ? `${im.area.toLocaleString("pt-BR")} m²` : null],
      ["Terreno", im.areaTerreno ? `${im.areaTerreno.toLocaleString("pt-BR")} m²` : null],
      ["Distância do mar", distancia(im.distanciaMar)?.replace(" do mar", "") ?? null],
      ["Lado", im.lado ? (im.lado === "praia" ? "Lado praia" : "Lado serra") : null],
      ["Condomínio", im.condominio ? brl(im.condominio) : null],
      ["IPTU", im.iptu ? brl(im.iptu) : null],
    ] as [string, string | null][]
  ).filter((x): x is [string, string] => Boolean(x[1]));
  const local = [im.endereco && im.mapaExato ? im.endereco : null, im.bairro, `${im.cidade} - SP`].filter(Boolean).join(", ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: im.titulo,
    url: `${site.url}/imovel/${im.slug}`,
    image: im.fotos.slice(0, 6),
    description: im.descricao,
    offers: im.preco ? { "@type": "Offer", price: im.preco, priceCurrency: "BRL" } : undefined,
  };

  return (
    <article className="inner">
      <nav className="crumbs mono" aria-label="Caminho">
        <Link href="/imoveis">Imóveis</Link><span>/</span>
        {im.bairro && <><Link href={`/imoveis?bairro=${encodeURIComponent(im.bairro)}`}>{im.bairro}</Link><span>/</span></>}
        <span aria-current="page">{cod}</span>
      </nav>

      <Galeria fotos={im.fotos} titulo={im.titulo} />

      <div className="det-grid">
        <div className="det-main">
          <div className="det-tags">
            <span className="tag mono">{im.finalidade === "aluguel" ? "Aluguel" : "Venda"}</span>
            {im.status !== "publicado" && <span className="tag mono dark">{im.status === "vendido" ? "Vendido" : "Alugado"}</span>}
            {im.financiamento && <span className="tag mono gold">Aceita financiamento</span>}
            {im.permuta && <span className="tag mono">Aceita permuta</span>}
          </div>
          <h1>{im.titulo}</h1>
          <p className="lbl mono">{[im.bairro, im.cidade].filter(Boolean).join(" · ")} · Cód. {cod}</p>

          <dl className="ficha">
            {ficha.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}
          </dl>

          {im.descricao && (
            <section className="det-sec">
              <h2>Sobre o imóvel</h2>
              <p className="desc">{im.descricao}</p>
            </section>
          )}

          {im.caracteristicas.length > 0 && (
            <section className="det-sec">
              <h2>Características</h2>
              <ul className="carac">{im.caracteristicas.map((c) => <li key={c}>{c}</li>)}</ul>
            </section>
          )}

          <section className="det-sec">
            <h2>Localização</h2>
            <div className="mapa">
              <iframe title={`Mapa: ${local}`} src={`https://www.google.com/maps?q=${encodeURIComponent(local)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="mapa-foot">
              <p className="lbl">{local}. {im.mapaExato ? "Localização exata." : "Localização aproximada por bairro; o endereço é passado no atendimento."}</p>
              <a className="btn-line" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`} target="_blank" rel="noopener"><span>Ver no Google Maps</span></a>
            </div>
          </section>
        </div>

        <aside className="det-side">
          <div className="price-card">
            <span className="mono">{im.finalidade === "aluguel" ? "Aluguel mensal" : "Valor de venda"}</span>
            <strong>{brl(im.preco)}</strong>
            {im.status === "publicado" ? (
              <a className="sim-cta" href={whatsappUrl(msg)} target="_blank" rel="noopener"><WhatsAppIcon size={19} /> Falar com a Elaine</a>
            ) : (
              <p className="pc-note">Este imóvel já foi {im.status}. Fale com a Elaine para ver opções parecidas.</p>
            )}
            {im.financiamento && im.finalidade === "venda" && <Link className="pc-sim mono" href="/#simulador">Simular financiamento →</Link>}
            <p className="pc-note">{site.corretora} · CRECI {site.creci}</p>
          </div>
        </aside>
      </div>

      {parecidos.length > 0 && <Parecidos lista={parecidos} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}

function Parecidos({ lista }: { lista: Imovel[] }) {
  return (
    <section className="det-sec parecidos">
      <h2>Imóveis parecidos</h2>
      <div className="cat-grid">{lista.map((im) => <ImovelCard key={im.id} im={im} />)}</div>
    </section>
  );
}
