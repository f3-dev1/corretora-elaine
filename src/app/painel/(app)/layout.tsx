import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/icons";
import { logado } from "@/lib/auth";
import { temBlob } from "@/lib/catalogo";
import { sair } from "../actions";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pn">
      <aside className="pn-side">
        <Link href="/painel" className="pn-logo"><Logo sub="PAINEL" /></Link>
        <nav className="pn-nav">
          <Link href="/painel">Imóveis</Link>
          <Link href="/painel/imovel/novo">+ Novo imóvel</Link>
          <a href="/" target="_blank" rel="noopener">Ver o site ↗</a>
        </nav>
        <form action={sair}><button type="submit" className="pn-sair">Sair</button></form>
      </aside>
      <div className="pn-main">
        <Suspense fallback={<div className="pn-skel big" />}>
          <Guarda>{children}</Guarda>
        </Suspense>
      </div>
    </div>
  );
}

async function Guarda({ children }: { children: React.ReactNode }) {
  await connection();
  if (!(await logado())) redirect("/painel/login");
  return (
    <>
      {!temBlob() && (
        <p className="pn-aviso">Modo de teste: o armazenamento não está ligado neste ambiente, então as alterações não serão salvas.</p>
      )}
      {children}
    </>
  );
}
