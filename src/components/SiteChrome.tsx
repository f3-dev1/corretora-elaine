import Link from "next/link";
import { Logo, WhatsAppIcon } from "./icons";
import { site, instagramUrl, whatsappUrl } from "@/data/site";

export function SiteHeader() {
  return (
    <header className="top show solid-top gutter">
      <div className="inner">
        <nav className="left mono" aria-label="Seções">
          <Link href="/imoveis?finalidade=venda">Comprar</Link>
          <Link href="/imoveis?finalidade=aluguel">Alugar</Link>
          <Link href="/#financiamento">Financiamento</Link>
        </nav>
        <Link href="/" aria-label={`${site.name}, início`}><Logo /></Link>
        <a className="right mono" href={whatsappUrl()} target="_blank" rel="noopener">↳ WhatsApp</a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="foot-simple gutter">
      <div className="inner fs-grid">
        <div className="fs-cta">
          <h2>Vamos achar o seu imóvel?</h2>
          <a className="fbtn solid" href={whatsappUrl()} target="_blank" rel="noopener"><WhatsAppIcon size={20} /> Chamar no WhatsApp</a>
        </div>
        <address className="mono fs-info">
          <span>{site.whatsappDisplay}</span>
          <span>{site.address} · {site.bairro}, {site.city} – {site.uf}</span>
          <span>{site.hoursShort}</span>
          <a href={instagramUrl} target="_blank" rel="noopener">@{site.instagram}</a>
        </address>
      </div>
      <div className="inner fbottom mono">
        <span>© 2026 {site.name} · <span className="nw">CRECI {site.creci}</span></span>
        <span className="sig">{site.tagline}</span>
        <Link className="mono" href="/painel">Área da corretora</Link>
      </div>
      <div className="big" aria-hidden="true">ZÊNITE</div>
    </footer>
  );
}
