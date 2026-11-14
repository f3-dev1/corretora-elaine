// Importa o catálogo público da Zênite no VoaReal para src/data/catalogo.json.
// Uso: node scripts/import-voareal.mjs   (lê o sitemap e cada anúncio, 4 por vez)
import { writeFile, mkdir } from "node:fs/promises";

const BASE = "https://voareal.com/zenite-imoveis";
const OUT = new URL("../src/data/catalogo.json", import.meta.url);
const UA = { "user-agent": "Mozilla/5.0 (compatible; zenite-import/1.0)" };
const CONC = 4;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 3) {
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch {}
    await sleep(800 * t);
  }
  return null;
}

const TIPOS = [
  ["chácara", "Chácara"], ["chacara", "Chácara"], ["sítio", "Sítio"], ["sitio", "Sítio"],
  ["sobrado", "Sobrado"], ["apartamento", "Apartamento"], ["kitnet", "Apartamento"],
  ["terreno", "Terreno"], ["lote", "Terreno"], ["comercial", "Comercial"], ["sala", "Comercial"],
  ["galpão", "Comercial"], ["casa", "Casa"],
];
function tipoDe(nome) {
  const n = nome.toLowerCase();
  for (const [k, v] of TIPOS) if (n.startsWith(k) || n.includes(` ${k} `)) return v;
  return "Casa";
}

function parse(html, url) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const g = blocks.flatMap((j) => j["@graph"] || [j]);
  const p = g.find((n) => n.offers);
  if (!p) return null;
  const bread = g.find((n) => n["@type"] === "BreadcrumbList")?.itemListElement?.map((i) => i.name) ?? [];
  const am = Object.fromEntries((p.amenityFeature ?? []).map((a) => [a.name, a.value]));

  // características: pares "rótulo|categoria" entre "Características" e "Localização aproximada"
  const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, "|").replace(/\s*\|\s*/g, "|").replace(/\|+/g, "|");
  const a = text.indexOf("|Características|");
  const b = text.indexOf("|Localização aproximada|");
  const pares = a > -1 && b > a ? text.slice(a + 17, b).split("|") : [];
  const caracteristicas = [];
  for (let i = 0; i + 1 < pares.length; i += 2) {
    const nome = pares[i].replace(/^Área (comum|privativa): /, "").trim();
    if (nome && nome !== "Localização" && !caracteristicas.includes(nome)) caracteristicas.push(nome);
  }
  const lado = caracteristicas.includes("Lado praia") ? "praia" : caracteristicas.includes("Lado serra") ? "serra" : null;
  const dist = Number(String(am["Distância da praia"] ?? "").replace(/\D/g, "")) || null;
  const slug = url.split("/").pop();
  const nome = (p.name ?? "").replace(/\s+/g, " ").trim();

  return {
    id: slug.split("-").pop(),
    slug,
    titulo: nome.replace(/, Itanhaém$/, ""),
    tipo: tipoDe(nome),
    finalidade: /Lease|Rent/i.test(p.offers.businessFunction ?? "") ? "aluguel" : "venda",
    status: "publicado",
    destaque: false,
    preco: Number(p.offers.price) || null,
    bairro: bread.length >= 4 ? bread[2] : null, // só quando o caminho tem o nível de bairro
    cidade: p.address?.addressLocality ?? "Itanhaém",
    quartos: p.numberOfBedrooms ?? null,
    banheiros: p.numberOfBathroomsTotal ?? null,
    area: p.floorSize?.value ?? null,
    distanciaMar: dist,
    lado,
    piscina: Boolean(am["Piscina"]) || caracteristicas.includes("Piscina"),
    financiamento: Boolean(am["Aceita financiamento"]) || caracteristicas.includes("Financiamento"),
    permuta: Boolean(am["Aceita permuta"]) || caracteristicas.includes("Permuta"),
    caracteristicas,
    descricao: (p.description ?? "").trim(),
    fotos: Array.isArray(p.image) ? p.image : p.image ? [p.image] : [],
    origem: url,
  };
}

// Preços fora da realidade (erros de digitação no cadastro de origem) ficam de fora do catálogo.
const precoErrado = (im) => {
  if (im.revisar?.length) return true;
  if (im.preco == null) return false;
  if (im.finalidade === "aluguel") return im.preco > 100_000;
  if (im.preco > 20_000_000 || im.preco < 20_000) return true;
  // acima de R$ 25 mil por m² não existe no litoral sul: é zero a mais
  return Boolean(im.area && im.area > 20 && im.preco / im.area > 25_000);
};
export const limpar = (lista) => lista.filter((im) => !precoErrado(im));

if (process.argv[2] === "--limpar") {
  const { readFile } = await import("node:fs/promises");
  const lista = JSON.parse(await readFile(OUT, "utf8"));
  const limpa = limpar(lista);
  await writeFile(OUT, JSON.stringify(limpa));
  console.log(`removidos: ${lista.length - limpa.length}, ficaram: ${limpa.length}`);
  process.exit(0);
}

const sm = await get(`${BASE}/sitemap.xml`);
if (!sm) { console.error("Não consegui ler o sitemap do VoaReal. Nada foi alterado."); process.exit(1); }
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u !== BASE && u.startsWith(`${BASE}/`));
console.log(`sitemap: ${urls.length} anúncios`);

const out = [];
let feitos = 0, falhas = 0;
async function worker(fila) {
  while (fila.length) {
    const u = fila.shift();
    const html = await get(u);
    const im = html && parse(html, u);
    if (im) out.push(im); else falhas++;
    if (++feitos % 50 === 0) console.log(`${feitos}/${urls.length} (falhas ${falhas})`);
    await sleep(150);
  }
}
const fila = [...urls];
await Promise.all(Array.from({ length: CONC }, () => worker(fila)));
const final = limpar(out);
if (final.length < urls.length * 0.7) { console.error(`Só ${final.length} de ${urls.length} anúncios vieram (${falhas} falhas). Abortado para não apagar o catálogo atual.`); process.exit(1); }
await mkdir(new URL(".", OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(final));
console.log(`Agora rode: node scripts/limpar-catalogo.mjs`);
console.log(`ok: ${final.length} importados (${out.length - final.length} com preço errado ficaram de fora), ${falhas} falhas`);
