// Limpa src/data/catalogo.json depois da importação. Uso: node scripts/limpar-catalogo.mjs
import { readFile, writeFile } from "node:fs/promises";

const ARQ = new URL("../src/data/catalogo.json", import.meta.url);
const lista = JSON.parse(await readFile(ARQ, "utf8"));
const antes = lista.length;
const log = {};
const conta = (k, n = 1) => (log[k] = (log[k] ?? 0) + n);

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const entidades = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const tituloCaso = (s) => s.toLowerCase().replace(/(^|[\s(-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (m) => m.toLowerCase());

// fotos de domínios que não respondem (404 ou devolvem HTML) e ícones do site de origem
const MORTOS = /filximoveis\.com\.br|fcximobiliaria\.com\.br|pinheiroimovel\.com\.br/i;
const ICONES = /vn_menutopo|list_det_placa|\/icons?\//i;
const HTTPS_OK = /trimarx|paduaecastellani|4agenciaimoveis/i;

let out = [];
for (const im of lista) {
  // registro corrompido pelo HTML de origem
  if (/document\.|createElement/.test(`${im.titulo} ${im.bairro}`)) { conta("removido: corrompido"); continue; }

  // fotos
  const fotos = [];
  for (let f of im.fotos ?? []) {
    if (MORTOS.test(f) || ICONES.test(f)) { conta("foto removida: quebrada/ícone"); continue; }
    if (f.startsWith("http://")) {
      if (HTTPS_OK.test(f)) { f = "https://" + f.slice(7); conta("foto: http→https"); }
      else { conta("foto removida: http sem https"); continue; }
    }
    if (!fotos.includes(f)) fotos.push(f);
  }
  im.fotos = fotos;

  // bairro
  if (im.bairro) {
    let b = entidades(im.bairro).replace(/\s*[-–(]\s*praia\s*\)?$/i, "").replace(/\s+/g, " ").trim();
    if (b === b.toUpperCase() || b === b.toLowerCase()) b = tituloCaso(b);
    if (norm(b) === norm(im.titulo) || b.length > 40) { b = null; conta("bairro inválido → vazio"); }
    if (b !== im.bairro) conta("bairro ajustado");
    im.bairro = b;
  }

  // título
  const t0 = im.titulo;
  im.titulo = entidades(im.titulo).replace(/,\s*Itanha[eé]m$/i, "").replace(/^Casa novo\b/, "Casa nova").replace(/\s+/g, " ").trim();
  if (im.titulo !== t0) conta("título ajustado");

  // números fora da realidade
  if (im.distanciaMar != null && (im.distanciaMar > 30000 || im.distanciaMar < 5)) { im.distanciaMar = null; conta("distância do mar absurda → vazio"); }
  if (im.area != null && im.area < 15) { im.area = null; conta("área absurda → vazio"); }
  if (im.tipo === "Terreno" && im.quartos) { im.quartos = null; conta("terreno sem quartos"); }

  // características
  im.caracteristicas = (im.caracteristicas ?? []).filter((c) => c.length >= 2 && c.length <= 60 && !/^\d+$/.test(c));

  im.atualizadoEm ??= "2026-11-14T00:00:00.000Z";
  out.push(im);
}

// bairros: junta grafias iguais (sem acento/maiúsculas) usando a forma mais comum
const grupos = new Map();
for (const im of out) if (im.bairro) {
  const k = norm(im.bairro);
  const g = grupos.get(k) ?? new Map();
  g.set(im.bairro, (g.get(im.bairro) ?? 0) + 1);
  grupos.set(k, g);
}
const canon = new Map([...grupos].map(([k, g]) => [k, [...g].sort((a, b) => b[1] - a[1])[0][0]]));
for (const im of out) if (im.bairro) im.bairro = canon.get(norm(im.bairro));

// duplicados: mesma capa = mesmo imóvel anunciado duas vezes (fica o primeiro)
const capas = new Set();
out = out.filter((im) => {
  const capa = im.fotos[0];
  if (!capa) return true;
  if (capas.has(capa)) { conta("removido: duplicado"); return false; }
  capas.add(capa);
  return true;
});

await writeFile(ARQ, JSON.stringify(out));
console.log(`antes ${antes}, depois ${out.length}, bairros distintos ${new Set(out.map((x) => x.bairro).filter(Boolean)).size}`);
console.table(log);
