# Zênite Imóveis

Site da corretora Elaine Nunes (Zênite Imóveis, Itanhaém – SP).

- **Stack:** Next.js (App Router) + TypeScript + Tailwind, GSAP + ScrollTrigger para animações, Lenis para rolagem suave.
- **Status:** home pronta como prévia, com imóveis de amostra do catálogo atual. Painel de cadastro (Supabase) e página de cada imóvel ainda por fazer.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Contatos, endereço, CRECI, horário | `src/data/site.ts` |
| Imóveis em destaque e fotos do topo | `src/data/imoveis.ts` |
| Seções da home | `src/app/page.tsx` e `src/components/` |
| Animações e rolagem suave | `src/components/Motion.tsx` e `src/components/Hero.tsx` |
| Cores, fontes e layout | `src/app/globals.css` |

Variável opcional: `NEXT_PUBLIC_SITE_URL` (domínio final, usado em SEO e sitemap).
