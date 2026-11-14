import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel | Zênite Imóveis",
  robots: { index: false, follow: false },
};

export default function PainelRoot({ children }: LayoutProps<"/painel">) {
  return <div className="pn-root">{children}</div>;
}
