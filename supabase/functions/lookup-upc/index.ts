// Deno Edge Function: server-side UPC cascade.
// Public (verify_jwt: false). Hits Open Food Facts and UPCItemDB and returns
// whichever responds first with a real hit. Browsers can't call UPCItemDB
// directly because of strict CORS; this function fronts both with permissive
// CORS so the client can stay simple.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function fromOpenFoodFacts(upc: string) {
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(upc)}.json`,
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (j.status !== 1 || !j.product) return null;
    const p = j.product;
    return {
      name: p.product_name || p.generic_name || null,
      brand: (p.brands || "").split(",")[0]?.trim() || null,
      photo_url: p.image_front_url || p.image_url || null,
      source: "openfoodfacts",
    };
  } catch {
    return null;
  }
}

async function fromUpcItemDb(upc: string) {
  try {
    const r = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`,
    );
    if (!r.ok) return null;
    const j = await r.json();
    const item = j.items?.[0];
    if (!item) return null;
    return {
      name: item.title || null,
      brand: item.brand || null,
      photo_url: item.images?.[0] || null,
      source: "upcitemdb",
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  const upc = url.searchParams.get("upc");
  if (!upc || !/^\d{6,14}$/.test(upc)) {
    return json({ error: "missing or malformed upc" }, 400);
  }

  let hit = await fromOpenFoodFacts(upc);
  if (!hit?.name) hit = await fromUpcItemDb(upc);

  return json(hit);
});
