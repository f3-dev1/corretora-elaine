import Link from "next/link";
import { imoveisDoPainel } from "@/lib/catalogo";
import PainelLista, { type Linha } from "./PainelLista";

export default async function PainelHome() {
  const lista = await imoveisDoPainel();
  const linhas: Linha[] = lista.map((im) => ({
    id: im.id,
    slug: im.slug,
    titulo: im.titulo,
    bairro: im.bairro,
    tipo: im.tipo,
    preco: im.preco,
    finalidade: im.finalidade,
    status: im.status,
    destaque: im.destaque,
    foto: im.fotos[0] ?? null,
    nfotos: im.fotos.length,
    revisar: Boolean(im.revisar?.length),
    atualizadoEm: im.atualizadoEm ?? null,
  }));
  const conta = (s: string) => lista.filter((x) => x.status === s).length;
  return (
    <>
      <header className="pn-top">
        <h1>Imóveis</h1>
        <Link href="/painel/imovel/novo" className="pn-btn">+ Novo imóvel</Link>
      </header>
      <div className="pn-stats">
        <div><small>Publicados</small><strong>{conta("publicado")}</strong></div>
        <div><small>Rascunhos</small><strong>{conta("rascunho")}</strong></div>
        <div><small>Vendidos</small><strong>{conta("vendido")}</strong></div>
        <div><small>Em destaque</small><strong>{lista.filter((x) => x.destaque).length}</strong></div>
      </div>
      <PainelLista linhas={linhas} />
    </>
  );
}
