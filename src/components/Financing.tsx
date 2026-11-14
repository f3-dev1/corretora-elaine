import Image from "next/image";

const etapas = [
  { tag: "Simulação", titulo: "Quanto dá para financiar", texto: "Sua renda, a entrada e o valor possível, antes de escolher o imóvel." },
  { tag: "Documentos", titulo: "Papéis e FGTS em ordem", texto: "O que separar e como usar o saldo do FGTS na entrada ou nas parcelas." },
  { tag: "Banco", titulo: "Análise do crédito", texto: "Acompanhamento da proposta até a resposta do banco." },
  { tag: "Chave", titulo: "Contrato e entrega", texto: "Assinatura do contrato e a chave na sua mão." },
];
const fotos = ["/img/coronel-3.jpg", "/img/gaivota.jpg", "/img/umuarama.webp", "/img/coronel-1.jpg"];

export default function Financing() {
  return (
    <section className="fin" id="financiamento" aria-label="Financiamento">
      <div className="stage">
        <div className="fin-photos" aria-hidden="true">
          {fotos.map((f, i) => (
            <div className={`fin-photo${i === 0 ? " on" : ""}`} key={f}>
              <Image src={f} alt="" fill sizes="100vw" />
            </div>
          ))}
        </div>
        <div className="inner gutter fin-in">
          <div>
            <span className="lbl mono">Financiamento e FGTS</span>
            <h2 className="split">
              <span className="line"><span>Quer financiar?</span></span>
              <span className="line"><span>A Elaine vai junto.</span></span>
            </h2>
            <p className="lead">Do primeiro cálculo à entrega da chave. O banco decide o crédito; ela acompanha cada etapa com você.</p>
          </div>
          <ol className="cards">
            {etapas.map((e, i) => (
              <li className={`card${i === 0 ? " active" : ""}`} key={e.tag}>
                <div className="card-head mono">
                  <span><strong>{String(i + 1).padStart(2, "0")}</strong> / {String(etapas.length).padStart(2, "0")}</span>
                  <span>{e.tag}</span>
                </div>
                <h3>{e.titulo}</h3>
                <p>{e.texto}</p>
                <div className="ticks" aria-hidden="true">
                  {etapas.map((x) => <i key={x.tag}><span /></i>)}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="fin-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
