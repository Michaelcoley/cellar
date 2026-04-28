// Formatting helpers — pure functions, no side effects.

export function fmtMoney(n, currency = 'USD') {
  if (n == null || isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(n));
}

export function fmtProof(p) {
  if (p == null || isNaN(Number(p))) return '—';
  return `${Number(p).toFixed(1).replace(/\.0$/, '')}°`;
}

export function fmtAbv(p) {
  if (p == null || isNaN(Number(p))) return '—';
  return `${(Number(p) / 2).toFixed(1).replace(/\.0$/, '')}% ABV`;
}

export function fmtMl(ml) {
  if (ml == null) return '—';
  if (ml >= 1000) return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `${ml} ml`;
}

export function fmtPct(n) {
  if (n == null) return '—';
  return `${Math.round(n)}%`;
}

export function daysSince(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / 86_400_000);
}

export function relativeDays(d) {
  if (d == null) return '—';
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  if (d < 365) return `${Math.round(d / 30)}mo ago`;
  return `${(d / 365).toFixed(1)}y ago`;
}

const POUR_OZ = 1.5;
const ML_PER_OZ = 29.5735;

export function pourCost(bottle, pourOz = POUR_OZ) {
  if (!bottle?.cost || !bottle?.size_ml) return null;
  const totalOz = bottle.size_ml / ML_PER_OZ;
  return (Number(bottle.cost) / totalOz) * pourOz;
}

export function poursRemaining(bottle, pourOz = POUR_OZ) {
  if (!bottle?.size_ml) return null;
  const remainingMl = bottle.size_ml * ((bottle.fill_pct ?? 100) / 100);
  return Math.floor(remainingMl / (pourOz * ML_PER_OZ));
}
