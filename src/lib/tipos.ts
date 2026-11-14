export type Finalidade = "venda" | "aluguel";
export type Status = "publicado" | "rascunho" | "vendido" | "alugado";

export type Imovel = {
  id: string;
  slug: string;
  titulo: string;
  tipo: string;
  finalidade: Finalidade;
  status: Status;
  destaque: boolean;
  preco: number | null;
  condominio?: number | null;
  iptu?: number | null;
  bairro: string | null;
  cidade: string;
  quartos: number | null;
  suites?: number | null;
  banheiros: number | null;
  vagas?: number | null;
  area: number | null;
  areaTerreno?: number | null;
  distanciaMar: number | null;
  lado: "praia" | "serra" | null;
  piscina: boolean;
  financiamento: boolean;
  permuta: boolean;
  caracteristicas: string[];
  descricao: string;
  fotos: string[];
  mapaExato?: boolean;
  endereco?: string | null;
  origem?: string;
  /** Avisos para a corretora conferir no painel (ex.: preço importado errado). */
  revisar?: string[];
  criadoEm?: string;
  atualizadoEm?: string;
};

export const TIPOS = ["Casa", "Chácara", "Sobrado", "Apartamento", "Terreno", "Sítio", "Comercial"] as const;

export const STATUS_LABEL: Record<Status, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  vendido: "Vendido",
  alugado: "Alugado",
};

export const visivel = (im: Imovel) => im.status !== "rascunho";
export const disponivel = (im: Imovel) => im.status === "publicado";

export const brl = (v: number | null | undefined) =>
  v == null ? "Sob consulta" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const codigo = (im: Pick<Imovel, "id">) => `ZN-${im.id.slice(-6).toUpperCase()}`;

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function distancia(m: number | null) {
  if (!m) return null;
  return m >= 1000 ? `${(m / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km do mar` : `${m} m do mar`;
}
