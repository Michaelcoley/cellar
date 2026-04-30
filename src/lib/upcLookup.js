// Cascading UPC lookup:
//   1. Local cache (localStorage) — instant
//   2. Curated premium DB (bundled JSON of allocated/notable bottles)
//   3. Edge function — server-side fan-out to Open Food Facts + UPCItemDB
//      (browsers can't hit UPCItemDB directly because of strict CORS).
//
// Always returns a partial bottle suggestion the user can confirm/edit.
// Never throws; any failure simply falls through to the next provider.

import curated from './curatedDb.json';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const CACHE_KEY = 'cellar:upc-cache:v1';
const CACHE_MAX = 500;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(cache) {
  const keys = Object.keys(cache);
  if (keys.length > CACHE_MAX) {
    const trimmed = {};
    keys.slice(-CACHE_MAX).forEach((k) => (trimmed[k] = cache[k]));
    cache = trimmed;
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota — ignore
  }
}

function fromCurated(upc) {
  const hit = curated[upc];
  if (!hit) return null;
  return { ...hit, source: 'curated' };
}

async function fromEdgeFunction(upc) {
  if (!SUPABASE_URL) return null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/functions/v1/lookup-upc?upc=${encodeURIComponent(upc)}`,
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (!j?.name) return null;
    return j;
  } catch {
    return null;
  }
}

function fuzzyGuess(name) {
  if (!name) return {};
  const lower = name.toLowerCase();
  if (/bourbon/.test(lower)) return { category: 'whiskey', subtype: 'Bourbon' };
  if (/\brye\b/.test(lower)) return { category: 'whiskey', subtype: 'Rye' };
  if (/tennessee/.test(lower)) return { category: 'whiskey', subtype: 'Tennessee' };
  if (/single malt/.test(lower)) return { category: 'whiskey', subtype: 'Single Malt Scotch' };
  if (/scotch|whisky/.test(lower)) return { category: 'whiskey', subtype: 'Blended Scotch' };
  if (/irish/.test(lower)) return { category: 'whiskey', subtype: 'Irish' };
  if (/whiskey/.test(lower)) return { category: 'whiskey' };
  if (/tequila/.test(lower)) return { category: 'tequila' };
  if (/mezcal/.test(lower)) return { category: 'mezcal' };
  if (/\brum\b/.test(lower)) return { category: 'rum' };
  if (/\bgin\b/.test(lower)) return { category: 'gin' };
  if (/vodka/.test(lower)) return { category: 'vodka' };
  if (/cognac/.test(lower)) return { category: 'cognac', subtype: 'VS' };
  if (/brandy/.test(lower)) return { category: 'cognac', subtype: 'American Brandy' };
  if (/amaro|liqueur/.test(lower)) return { category: 'liqueur' };
  if (/vermouth/.test(lower)) return { category: 'vermouth' };
  return {};
}

export async function lookupUpc(upc) {
  if (!upc) return null;
  const cache = readCache();
  if (cache[upc]) return { ...cache[upc], source: 'cache' };

  let suggestion = fromCurated(upc);
  if (!suggestion) suggestion = await fromEdgeFunction(upc);

  if (!suggestion) return null;

  const enriched = { ...fuzzyGuess(suggestion.name), ...suggestion, upc };
  cache[upc] = enriched;
  writeCache(cache);
  return enriched;
}

export function clearUpcCache() {
  localStorage.removeItem(CACHE_KEY);
}
