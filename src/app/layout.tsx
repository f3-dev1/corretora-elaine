import type { Metadata, Viewport } from "next";
import { Cinzel, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600"], variable: "--f-logo" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--f-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--f-mono" });

const title = "Zênite Imóveis | Casas e chácaras em Itanhaém – Elaine Nunes";
const description =
  "Casas, chácaras na praia e terrenos para comprar ou alugar em Itanhaém, litoral sul de SP. Atendimento direto com a corretora Elaine Nunes e apoio no financiamento e FGTS.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title,
    description,
    images: [{ url: "/img/coronel-2.jpg", width: 1800, height: 1350, alt: "Chácara no Jardim Coronel, Itanhaém" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/img/coronel-2.jpg"] },
};

export const viewport: Viewport = { themeColor: "#3A271C", viewportFit: "cover" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: site.name,
  url: site.url,
  image: `${site.url}/img/fachada.webp`,
  telephone: `+${site.whatsapp}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressLocality: site.city,
    addressRegion: site.uf,
    postalCode: site.cep,
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "17:00" },
  ],
  areaServed: "Itanhaém, SP",
  sameAs: [`https://www.instagram.com/${site.instagram}/`],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${hanken.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
