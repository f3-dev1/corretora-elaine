import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ImovelCard from "@/components/ImovelCard";
import FiltroForm from "@/components/FiltroForm";
import { todosImoveis } from "@/lib/catalogo";
import { filtrar, opcoes, type Filtros } from "@/lib/filtros";

export const metadata: Metadata = {
  title: "Imóveis à venda e para alugar em Itanhaém | Zênite Imóveis",
  description: "Casas, chácaras, apartamentos e terrenos em Itanhaém e litoral sul de SP. Filtre por bairro, preço, quartos, piscina e distância do mar.",
  alternates: { canonical: "/imoveis" },
};

export default async function ImoveisPage(props: PageProps<"/imoveis">) {
  const lista = await todosImoveis();
  const { tipos, bairros } = opcoes(lista);
  return (
    <>
      <SiteHeader />
      <main className="cat gutter">
        <div className="inner">
          <header className="cat-head">
            <span className="lbl mono">Catálogo · Itanhaém e litoral sul</span>
            <h1>Imóveis</h1>
          </header>
          <Suspense fallback={<div className="filtros skel" aria-hidden="true" />}>
            <FiltroForm tipos={tipos} bairros={bairros} />
          </Suspense>
          <Suspense fallback={<p className="lbl mono cat-count">Carregando imóveis…</p>}>
            <Resultados searchParams={props.searchParams} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

async function Resultados({ searchParams }: Pick<PageProps<"/imoveis">, "searchParams">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const f: Filtros = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const { itens, total, pagina, paginas } = filtrar(await todosImoveis(), f);
  const link = (p: number) => {
    const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]);
    if (p > 1) q.set("p", String(p)); else q.delete("p");
    return `/imoveis${q.size ? `?${q}` : ""}`;
  };
  return (
    <>
      <p className="lbl mono cat-count">{total.toLocaleString("pt-BR")} {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}</p>
      {itens.length === 0 ? (
        <div className="vazio">
          <h2>Nenhum imóvel com esses filtros.</h2>
          <p>Tente tirar algum filtro, ou fale com a Elaine: ela pode ter algo que ainda não está no site.</p>
          <Link className="btn-line" href="/imoveis"><span>Ver todos</span></Link>
        </div>
      ) : (
        <div className="cat-grid">{itens.map((im) => <ImovelCard key={im.id} im={im} />)}</div>
      )}
      {paginas > 1 && (
        <nav className="pag mono" aria-label="Páginas">
          {pagina > 1 ? <Link href={link(pagina - 1)} scroll>← Anterior</Link> : <span />}
          <span>Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link href={link(pagina + 1)} scroll>Próxima →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
