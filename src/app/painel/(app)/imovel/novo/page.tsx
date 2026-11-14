import { imoveisDoPainel } from "@/lib/catalogo";
import ImovelForm from "../ImovelForm";

export default async function NovoImovel() {
  const lista = await imoveisDoPainel();
  const bairros = [...new Set(lista.map((x) => x.bairro).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return (
    <>
      <header className="pn-top"><h1>Novo imóvel</h1></header>
      <ImovelForm bairros={bairros} />
    </>
  );
}
