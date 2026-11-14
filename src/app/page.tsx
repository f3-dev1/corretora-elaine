import Image from "next/image";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import Financing from "@/components/Financing";
import Simulator from "@/components/Simulator";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import Motion from "@/components/Motion";
import { Logo } from "@/components/icons";
import { bairros, site, whatsappUrl } from "@/data/site";

export default function Home() {
  return (
    <>
      <header className="top gutter" id="top">
        <div className="inner">
          <nav className="left mono" aria-label="Seções">
            <a href="#imoveis">Imóveis</a>
            <a href="#financiamento">Financiamento</a>
            <a href="#sobre">Sobre</a>
          </nav>
          <a href="#inicio" aria-label={`${site.name}, início`}><Logo /></a>
          <a className="right mono" href={whatsappUrl()} target="_blank" rel="noopener">↳ WhatsApp</a>
        </div>
      </header>

      <Hero />

      <main className="after" id="after">
        <section className="facts gutter" aria-label="Números">
          <ul className="inner">
            <li><span className="lbl mono">Anúncios no catálogo</span><strong data-count={site.catalogCount}>{site.catalogCount}</strong></li>
            <li><span className="lbl mono">Nota no Google</span><strong data-count={site.googleRating} data-dec="1">{site.googleRating.toLocaleString("pt-BR")}</strong></li>
            <li><span className="lbl mono">Especialidade</span><strong>Chácaras</strong></li>
            <li><span className="lbl mono">Financiamento e FGTS</span><strong>Do início à chave</strong></li>
            <li><span className="lbl mono">Atendimento</span><strong>Seg a sáb</strong></li>
          </ul>
        </section>

        <div className="marquee" aria-label="Bairros atendidos">
          <div className="track">
            {[...bairros, ...bairros].map((b, i) => (
              <span key={i} aria-hidden={i >= bairros.length || undefined}>{b}</span>
            ))}
          </div>
        </div>

        <Listings />
        <Financing />
        <Simulator />

        <section className="about gutter" id="sobre">
          <div className="inner wrap2">
            <figure className="portrait">
              <div className="ph">
                <Image src="/img/elaine.jpg" alt="Elaine Nunes, corretora da Zênite Imóveis, de blazer vermelho, sorrindo" fill sizes="380px" />
              </div>
              <figcaption className="lbl mono">{site.corretora} · CRECI {site.creci}</figcaption>
            </figure>
            <div>
              <h2 className="split">
                <span className="line"><span>Corretora em Itanhaém,</span></span>
                <span className="line"><span>no escritório e na rua.</span></span>
              </h2>
              <p className="up">
                {site.corretora} ajuda famílias a conquistar o primeiro imóvel e a encontrar a chácara perto da praia, com o financiamento resolvido junto.
              </p>
              <p className="up">{site.tagline}</p>
              <div className="quote up">
                <blockquote>“Todo o processo foi conduzido com muita transparência, confiança e competência.”</blockquote>
                <span className="lbl mono">Avaliação no Google</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SearchBar />
      <Motion />
    </>
  );
}
