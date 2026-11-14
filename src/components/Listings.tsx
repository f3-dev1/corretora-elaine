import Image from "next/image";
import Link from "next/link";
import { destaques as amostra } from "@/data/imoveis";
import { todosImoveis } from "@/lib/catalogo";
import { brl, distancia } from "@/lib/tipos";

type Card = { key: string; titulo: string; bairro: string; preco: number | null; fatos: string[]; selo?: string; img: string; alt: string; formato: "wide" | "narrow"; href: string };

// Os destaques marcados no painel; sem nenhum marcado, usa a amostra fixa.
async function cards(): Promise<{ lista: Card[]; total: number }> {
  const todos = await todosImoveis();
  const visiveis = todos.filter((x) => x.status === "publicado");
  const marcados = visiveis.filter((x) => x.destaque && x.fotos.length).slice(0, 6);
  const padrao: ("wide" | "narrow")[] = ["wide", "narrow", "narrow", "wide", "wide", "narrow"];
  if (marcados.length >= 2) {
    return {
      total: visiveis.length,
      lista: marcados.map((im, i) => ({
        key: im.id,
        titulo: im.titulo,
        bairro: im.bairro ?? im.cidade,
        preco: im.preco,
        fatos: [im.quartos ? `${im.quartos} quartos` : "", im.area ? `${im.area} m²` : "", distancia(im.distanciaMar) ?? ""].filter(Boolean),
        selo: im.financiamento ? "Aceita financiamento" : im.permuta ? "Aceita permuta" : undefined,
        img: im.fotos[0],
        alt: im.titulo,
        formato: padrao[i % padrao.length],
        href: `/imovel/${im.slug}`,
      })),
    };
  }
  return {
    total: visiveis.length,
    lista: amostra.map((im) => ({ key: im.codigo, titulo: im.titulo, bairro: im.bairro, preco: im.preco, fatos: im.fatos, selo: im.selo, img: im.img, alt: im.alt, formato: im.formato, href: `/imoveis?bairro=${encodeURIComponent(im.bairro)}` })),
  };
}

export default async function Listings() {
  const { lista, total } = await cards();
  return (
    <section className="gutter" id="imoveis">
      <div className="inner">
        <div className="head">
          <h2 className="split">
            <span className="line"><span>Imóveis escolhidos</span></span>
            <span className="line"><span>entre {total.toLocaleString("pt-BR")}.</span></span>
          </h2>
          <p className="up">Chácaras com piscina, casas novas e imóveis perto do mar. Todos com ficha completa e conversa direta com a Elaine.</p>
        </div>
        <div className="grid">
          {lista.map((im) => (
            <Link key={im.key} className={`item ${im.formato}`} href={im.href}>
              <div className="ph">
                {im.selo && <span className="tag mono">{im.selo}</span>}
                {im.img.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={im.img} alt={im.alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                ) : (
                  <Image src={im.img} alt={im.alt} fill sizes={im.formato === "wide" ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 40vw"} />
                )}
                <span className="view mono">Ver imóvel →</span>
              </div>
              <h3>{im.titulo} <span>{brl(im.preco)}</span></h3>
              <p className="lbl mono"><span>{im.bairro}</span>{im.fatos.map((f) => <span key={f}>{f}</span>)}</p>
            </Link>
          ))}
        </div>
        <div className="more up">
          <Link className="btn-line" href="/imoveis"><span>Ver os {total.toLocaleString("pt-BR")} imóveis</span><span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
