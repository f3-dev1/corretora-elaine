/**
 * Interpreta números digitados em formato brasileiro ("1.500.000", "441,5", "R$ 300 mil", "1,5 milhão")
 * ou vindos como número (440.7). Devolve null para vazio ou para o que não dá para entender.
 */
export function num(v: unknown): number | null {
  if (v === "" || v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const bruto = String(v).trim().toLowerCase();
  if (!bruto) return null;
  const mult = /milh/.test(bruto) ? 1e6 : /\bmil\b/.test(bruto) ? 1e3 : 1;
  let s = bruto.replace(/r\$|\s|milh(ão|ões|ao|oes)|mil/g, "");
  if (!/^[\d.,]+$/.test(s)) return null;
  if (s.includes(",")) {
    if (s.indexOf(",") !== s.lastIndexOf(",")) return null; // "1,500,000" é ambíguo
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  } else if ((s.match(/\./g) ?? []).length > 1) {
    return null;
  }
  const n = Number(s) * mult;
  return Number.isFinite(n) ? n : null;
}
