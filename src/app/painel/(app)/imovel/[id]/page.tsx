import Link from "next/link";
import { notFound } from "next/navigation";
import { todosImoveisFresco } from "@/lib/catalogo";
import { codigo } from "@/lib/tipos";
import ImovelForm from "../ImovelForm";

export default async function EditarImovel(props: PageProps<"/painel/imovel/[id]">) {
  const { id } = await props.params;
  const lista = await todosImoveisFresco();
  const im = lista.find((x) => x.id === id);
  if (!im) notFound();
  const bairros = [...new Set(lista.map((x) => x.bairro).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return (
    <>
      <header className="pn-top">
        <div>
          <span className="pn-code">{codigo(im)}</span>
          <h1>Editar imóvel</h1>
        </div>
        <Link href={`/imovel/${im.slug}`} target="_blank" className="pn-btn ghost">Ver no site ↗</Link>
      </header>
      <ImovelForm inicial={im} bairros={bairros} />
    </>
  );
}
