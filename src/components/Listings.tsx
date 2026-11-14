import Image from "next/image";
import { brl, destaques } from "@/data/imoveis";
import { site, whatsappUrl } from "@/data/site";

export default function Listings() {
  return (
    <section className="gutter" id="imoveis">
      <div className="inner">
        <div className="head">
          <h2 className="split">
            <span className="line"><span>Seis de oitocentos</span></span>
            <span className="line"><span>e sessenta e seis.</span></span>
          </h2>
          <p className="up">
            Chácaras com piscina, casas novas e imóveis perto do mar. Todos com ficha completa e conversa direta com a Elaine.
          </p>
        </div>
        <div className="grid">
          {destaques.map((im) => (
            <a
              key={im.codigo}
              className={`item ${im.formato}`}
              href={whatsappUrl(`Olá, Elaine! Tenho interesse no imóvel "${im.titulo}" em ${im.bairro} (${brl(im.preco)}). Vi no site.`)}
              target="_blank"
              rel="noopener"
            >
              <div className="ph">
                {im.selo && <span className="tag mono">{im.selo}</span>}
                <Image
                  src={im.img}
                  alt={im.alt}
                  fill
                  sizes={im.formato === "wide" ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 40vw"}
                />
                <span className="view mono">Quero saber mais →</span>
              </div>
              <h3>
                {im.titulo} <span>{brl(im.preco)}</span>
              </h3>
              <p className="lbl mono">
                <span>{im.bairro}</span>
                {im.fatos.map((f) => <span key={f}>{f}</span>)}
              </p>
            </a>
          ))}
        </div>
        <div className="more up">
          <a className="btn-line" href={whatsappUrl("Olá, Elaine! Quero ver mais imóveis.")} target="_blank" rel="noopener">
            <span>Ver os {site.catalogCount} imóveis</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
