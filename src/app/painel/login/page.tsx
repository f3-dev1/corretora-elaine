import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/icons";
import { logado, painelConfigurado } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="pn-login">
      <div className="pn-login-card">
        <Logo sub="PAINEL" />
        <h1>Entrar no painel</h1>
        <Suspense fallback={<div className="pn-skel" />}>
          <Conteudo />
        </Suspense>
      </div>
    </main>
  );
}

async function Conteudo() {
  await connection();
  if (await logado()) redirect("/painel");
  if (!painelConfigurado()) {
    return (
      <p className="pn-aviso">
        O painel ainda não tem senha. Crie a variável <code>PAINEL_SENHA</code> nas configurações do projeto na Vercel e publique de novo.
      </p>
    );
  }
  return <LoginForm />;
}
