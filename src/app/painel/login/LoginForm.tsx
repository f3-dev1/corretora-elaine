"use client";

import { useActionState } from "react";
import { entrar } from "../actions";

export default function LoginForm() {
  const [estado, acao, enviando] = useActionState(entrar, null);
  return (
    <form action={acao} className="pn-form-login">
      <label htmlFor="senha">Senha</label>
      <input id="senha" name="senha" type="password" autoComplete="current-password" required autoFocus />
      {estado?.erro && <p className="pn-erro" role="alert">{estado.erro}</p>}
      <button type="submit" className="pn-btn" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
