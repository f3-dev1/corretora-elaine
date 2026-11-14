import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, sessaoValida } from "@/lib/auth";

// Barreira extra: nenhuma página do painel (fora o login) responde sem sessão válida.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/painel/login") return NextResponse.next();
  if (!sessaoValida(request.cookies.get(COOKIE)?.value)) {
    const res = NextResponse.redirect(new URL("/painel/login", request.url));
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/painel", "/painel/:path*"],
};
