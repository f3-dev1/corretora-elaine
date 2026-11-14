// Amostra real do catálogo atual (VoaReal). Será substituída pelos imóveis do painel.
export type Imovel = {
  codigo: string;
  titulo: string;
  bairro: string;
  preco: number;
  fatos: string[];
  selo?: string;
  img: string;
  alt: string;
  formato: "wide" | "narrow";
};

export const destaques: Imovel[] = [
  {
    codigo: "ZN-0945",
    titulo: "Casa com piscina",
    bairro: "Umuarama",
    preco: 945000,
    fatos: ["3 quartos", "183 m²", "2 km do mar"],
    selo: "Aceita financiamento",
    img: "/img/umuarama.webp",
    alt: "Piscina azul diante de casa amarela de telhado vermelho",
    formato: "wide",
  },
  {
    codigo: "ZN-0490",
    titulo: "Chácara com lago",
    bairro: "Parque Real",
    preco: 490000,
    fatos: ["4 quartos", "Piscina"],
    img: "/img/parquereal.jpeg",
    alt: "Chácara com lago, gramado e casa de dois pavimentos",
    formato: "narrow",
  },
  {
    codigo: "ZN-0400",
    titulo: "Chácara na mata",
    bairro: "São Fernando",
    preco: 400000,
    fatos: ["4 quartos", "Piscina"],
    selo: "Aceita financiamento",
    img: "/img/saofernando.webp",
    alt: "Casa térrea branca com varanda longa cercada de mata",
    formato: "narrow",
  },
  {
    codigo: "ZN-0580",
    titulo: "Casa a 600 m do mar",
    bairro: "Belas Artes",
    preco: 580000,
    fatos: ["2 quartos", "156 m²"],
    selo: "Aceita financiamento",
    img: "/img/belasartes.jpeg",
    alt: "Casa de tijolo aparente com varanda de madeira e garagem coberta",
    formato: "wide",
  },
  {
    codigo: "ZN-0270",
    titulo: "Casa nova",
    bairro: "Gaivota",
    preco: 270000,
    fatos: ["2 quartos", "Piscina", "1,2 km do mar"],
    selo: "Casa nova",
    img: "/img/gaivota.jpg",
    alt: "Casa nova de muro claro e telhado cerâmico",
    formato: "wide",
  },
  {
    codigo: "ZN-0850",
    titulo: "Chácara 7 quartos",
    bairro: "Jardim Coronel",
    preco: 850000,
    fatos: ["440 m²", "Piscina"],
    selo: "Aceita permuta",
    img: "/img/coronel-1.jpg",
    alt: "Chácara com palmeira, piscina e casa térrea amarela",
    formato: "narrow",
  },
];

export const heroSlides = [
  { img: "/img/coronel-2.jpg", alt: "Gramado amplo com mangueira e casa térrea amarela, chácara no Jardim Coronel", legenda: "Chácara · Jardim Coronel · R$ 850.000" },
  { img: "/img/umuarama.webp", alt: "Piscina azul diante de casa amarela de telhado vermelho", legenda: "Casa com piscina · Umuarama · R$ 945.000" },
  { img: "/img/parquereal.jpeg", alt: "Chácara com lago, gramado e casa de dois pavimentos", legenda: "Chácara com lago · Parque Real · R$ 490.000" },
  { img: "/img/belasartes.jpeg", alt: "Casa de tijolo aparente com varanda de madeira", legenda: "Casa a 600 m do mar · Belas Artes · R$ 580.000" },
];

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
