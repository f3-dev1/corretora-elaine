"use client";

import { site, instagramUrl, whatsappUrl } from "@/data/site";
import { WhatsAppIcon } from "./icons";

export default function Footer() {
  return (
    <div className="reveal" id="contato">
      <footer className="gutter">
        <div className="big" aria-hidden="true">ZÊNITE</div>
        <div className="fcenter">
          <h2 className="f-in">Vamos achar o seu imóvel?</h2>
          <div className="pills f-in">
            <a className="fbtn solid magnetic" href={whatsappUrl()} target="_blank" rel="noopener">
              <WhatsAppIcon size={20} /> Chamar no WhatsApp
            </a>
            <a className="fbtn magnetic" href="#imoveis">Ver imóveis</a>
            <a className="fbtn magnetic" href={instagramUrl} target="_blank" rel="noopener">Instagram</a>
          </div>
          <address className="finfo mono f-in">
            <span>{site.whatsappDisplay}</span>
            <span>{site.address} · {site.bairro}, {site.city} – {site.uf}</span>
            <span>{site.hoursShort}</span>
          </address>
        </div>
        <div className="inner fbottom mono">
          <span>© 2026 {site.name} · <span className="nw">CRECI {site.creci}</span></span>
          <span className="sig">{site.tagline}</span>
          <button
            className="totop magnetic"
            type="button"
            aria-label="Voltar ao topo"
            onClick={() => window.dispatchEvent(new CustomEvent("zenite:top"))}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
