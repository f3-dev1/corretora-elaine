export const site = {
  name: "Zênite Imóveis",
  corretora: "Elaine Nunes",
  creci: "314779-F",
  whatsapp: "5513996098936",
  whatsappDisplay: "(13) 99609-8936",
  instagram: "elaine.zeniteimoveis",
  address: "R. Ver. Angelino de Bortoli, 15",
  bairro: "Belas Artes",
  city: "Itanhaém",
  uf: "SP",
  cep: "11746-772",
  hours: "Segunda a sábado, 9h às 17h",
  hoursShort: "Seg a sáb · 9h às 17h",
  tagline: "Conectando você ao imóvel certo.",
  catalogCount: 866,
  googleRating: 4.9,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zenite-imoveis.vercel.app",
};

export const instagramUrl = `https://www.instagram.com/${site.instagram}/`;

export function whatsappUrl(message = "Olá, Elaine! Vim pelo site e quero ajuda para encontrar um imóvel.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const bairros = [
  "Jardim Coronel",
  "Belas Artes",
  "Bopiranga",
  "Gaivota",
  "Umuarama",
  "Parque Real",
  "São Fernando",
  "Guapiranga",
  "Guapurá",
  "Tupi",
  "Nova Itanhaém",
  "Jardim das Palmeiras",
];
