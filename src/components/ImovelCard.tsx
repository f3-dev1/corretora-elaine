import Link from "next/link";
import type { Imovel } from "@/lib/tipos";
import { brl, distancia } from "@/lib/tipos";

export default function ImovelCard({ im }: { im: Imovel }) {
  const fatos = [
    im.quartos ? `${im.quartos} ${im.quartos === 1 ? "quarto" : "quartos"}` : null,
    im.area ? `${im.area.toLocaleString("pt-BR")} m²` : null,
    distancia(im.distanciaMar),
  ].filter(Boolean);
  const selo =
    im.status === "vendido" ? "Vendido" : im.status === "alugado" ? "Alugado" : im.financiamento ? "Aceita financiamento" : im.permuta ? "Aceita permuta" : null;
  return (
    <Link className={`card-im${im.status !== "publicado" ? " off" : ""}`} href={`/imovel/${im.slug}`}>
      <div className="ph">
        {im.fotos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={im.fotos[0]} alt={im.titulo} loading="lazy" decoding="async" />
        ) : (
          <span className="noph mono">Sem foto</span>
        )}
        <span className="tag mono">{im.finalidade === "aluguel" ? "Aluguel" : "Venda"}</span>
        {selo && <span className={`tag tag-r mono${im.status !== "publicado" ? " dark" : ""}`}>{selo}</span>}
        {im.fotos.length > 1 && <span className="count mono">{im.fotos.length} fotos</span>}
      </div>
      <div className="ci-body">
        <span className="lbl mono">{im.tipo}{im.bairro ? ` · ${im.bairro}` : ""}</span>
        <h3>{im.titulo}</h3>
        {fatos.length > 0 && <p className="lbl mono ci-f">{fatos.map((f) => <span key={f!}>{f}</span>)}</p>}
        <strong className="ci-p">
          {brl(im.preco)}
          {im.finalidade === "aluguel" && im.preco ? <small>/mês</small> : null}
        </strong>
      </div>
    </Link>
  );
}
