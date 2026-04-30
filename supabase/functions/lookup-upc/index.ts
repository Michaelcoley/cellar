// Deno Edge Function: server-side UPC cascade with Claude enrichment.
//
// Flow:
//   1. Try Open Food Facts (CORS-friendly but rarely carries spirits)
//   2. Try UPCItemDB (CORS-locked, can't call from browser, hence this proxy)
//   3. If we got a name back, ask Claude Haiku 4.5 to enrich with category,
//      subtype, proof, age, distillery, region, and mash bill — fields the
//      free providers don't carry.
//
// The enrichment system prompt is large and stable, marked with cache_control
// so subsequent UPC lookups within ~5 minutes pay ~10% of input cost.
//
// All responses carry permissive CORS so the client can call directly.

import Anthropic from "npm:@anthropic-ai/sdk@^0.65.0";

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

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

const ENRICHMENT_SYSTEM = `You are a spirits-database enrichment assistant. A personal cellar app scans bottles by UPC; the lookup returns a coarse product title and brand, and you fill in the structured metadata a serious collector would want.

# Response format

Return a single JSON object with exactly these fields. Use null for any field you cannot determine with high confidence — never guess. Do not include any other fields, explanations, or prose.

- category: one of "whiskey", "tequila", "mezcal", "rum", "gin", "vodka", "cognac", "liqueur", "vermouth", "other"
- subtype: a string from the taxonomy below, matching the chosen category. Use null for "other".
- proof: number — US proof (2× ABV). Round to one decimal.
- age_years: integer — explicit age statement only. NAS bottlings (no age statement) → null.
- distillery: string — the actual production distillery, not the brand owner. (e.g. Eagle Rare's brand is "Eagle Rare", but the distillery is "Buffalo Trace Distillery".)
- region: string — concise origin, format "Sub-region, Country" where useful (e.g. "Kentucky, USA", "Islay, Scotland", "Speyside, Scotland", "Jalisco, Mexico", "Japan", "Highlands, Scotland").
- mash_bill: string — for American whiskeys only. Format as percentages, e.g. "78/10/12 corn/rye/malt" or "~75/13/12 corn/rye/malt" if approximate. Null for everything except bourbon/rye/Tennessee/American single malt — and null even for those if the mash bill is not publicly known.

# Category taxonomy

## whiskey
- "Bourbon" — at least 51% corn mash, new charred oak, USA. Examples: Buffalo Trace, Maker's Mark, Eagle Rare, Pappy Van Winkle, Wild Turkey, Knob Creek, Four Roses, Heaven Hill, Old Forester, Bulleit, Woodford Reserve, Weller, Stagg, EH Taylor, Elijah Craig.
- "Rye" — at least 51% rye mash, USA or Canada. Examples: Sazerac Rye, Whistlepig, Knob Creek Rye, Bulleit Rye, High West, Pikesville, Rittenhouse, Templeton.
- "Tennessee" — bourbon-style but Lincoln-County (charcoal) mellowed. Examples: Jack Daniel's, George Dickel.
- "Single Malt Scotch" — 100% malted barley, single Scottish distillery. Examples: Lagavulin, Laphroaig, Ardbeg, Bowmore, Bunnahabhain, Caol Ila, Bruichladdich (Islay); Macallan, Glenfiddich, Glenlivet, Aberlour, Balvenie, Glenfarclas, Glendronach, Mortlach (Speyside); Highland Park (Orkney); Talisker (Skye); Oban, Glenmorangie, Dalmore, Clynelish, GlenDronach (Highlands); Springbank, Glen Scotia (Campbeltown); Auchentoshan (Lowlands).
- "Blended Scotch" — blend of malt and grain whiskies. Examples: Johnnie Walker, Chivas Regal, Dewar's, Famous Grouse, Cutty Sark, J&B, Ballantine's, Compass Box.
- "Irish" — Irish whiskey, often triple-distilled. Examples: Jameson, Redbreast, Green Spot, Yellow Spot, Powers, Tullamore Dew, Bushmills, Midleton, Teeling, Connemara.
- "Japanese" — Japanese whisky. Note "Whisky" without the e is the local convention. Examples: Hibiki, Yamazaki, Hakushu, Toki (all Suntory); Nikka (Yoichi, Miyagikyo, From the Barrel, Coffey Grain, Coffey Malt, Taketsuru); Chichibu; Mars Iwai.
- "American Single Malt" — single-distillery US malt whiskey. Examples: Westland, Stranahan's, Balcones, Westward, Hillrock, McCarthy's, Virginia Distillery Co.
- "Canadian" — Canadian whisky/rye. Examples: Crown Royal, Canadian Club, Forty Creek, Lot 40, Pike Creek, Wiser's, JP Wiser's, Caribou Crossing.
- "World Whisky" — anything else. Indian (Amrut, Paul John, Rampur), Taiwanese (Kavalan), Australian (Sullivans Cove, Starward), French (Brenne), Israeli (Milk & Honey), Welsh (Penderyn).

## tequila
- "Blanco" — unaged or rested <2 months, clear. Also "Plata", "Silver".
- "Reposado" — aged 2-12 months in oak.
- "Añejo" — aged 1-3 years in oak.
- "Extra Añejo" — aged >3 years.
- "Cristalino" — aged tequila filtered to clear.

Examples: Don Julio, Patrón, Casa Dragones, Clase Azul, Cazadores, Herradura, Fortaleza, El Tesoro, Tequila Ocho, Casa Noble, Espolòn, Casamigos, Avión, 818, Código 1530, Volcan, Komos, Lobos 1707, Mijenta, Codigo, El Tequileño, Tapatío, Siete Leguas.

## mezcal
- "Joven" — unaged.
- "Reposado" — aged 2-12 months.
- "Añejo" — aged 1-3 years.
- "Ensamble" — blend of agave varieties.

Examples: Del Maguey, Mezcal Vago, Ilegal, Mezcal Unión, Bozal, Real Minero, Madre, Montelobos, Banhez, El Silencio.

## rum
- "White" — unaged or filtered clear.
- "Gold" — moderately aged.
- "Dark" — heavy molasses-style.
- "Aged" — explicitly aged with statement.
- "Spiced" — flavored.
- "Agricole" — French-style from sugar cane juice.
- "Overproof" — 50% ABV+.

Examples: Bacardi, Mount Gay, Appleton Estate, Plantation, El Dorado, Diplomático, Ron Zacapa, Flor de Caña, Havana Club, Goslings, Pusser's, Smith & Cross, Hamilton, Foursquare, Doorly's, Rhum Clément, Rhum JM, Wray & Nephew.

## gin
- "London Dry" — dry, juniper-forward, post-distillation flavoring not allowed.
- "Old Tom" — slightly sweetened, historic style.
- "Plymouth" — geographic protected style, slightly less juniper-forward.
- "Navy Strength" — 57% ABV+.
- "Contemporary" — modern botanical-forward style. Hendrick's, The Botanist.
- "Genever" — Dutch, malted-grain base.

Examples: Tanqueray, Beefeater, Bombay Sapphire, Hendrick's, The Botanist, Plymouth, Sipsmith, Monkey 47, Roku, Aviation, Citadelle, Nolet's, Gin Mare, Bols Genever.

## vodka
- "Grain", "Potato", "Wheat", "Rye", "Flavored".

Examples: Belvedere, Grey Goose, Tito's, Ketel One, Stolichnaya, Absolut, Russian Standard, Chopin, Reyka, Crystal Head.

## cognac
- "VS", "VSOP", "XO", "Hors d'Âge" (Cognac proper).
- "Armagnac" — different region, different rules.
- "Calvados" — apple brandy, Normandy.
- "Pisco" — Peruvian/Chilean grape spirit.
- "American Brandy" — generic catch-all.

Examples: Hennessy, Rémy Martin, Martell, Courvoisier, Pierre Ferrand, Hine, Camus, Frapin, Delamain.

## liqueur
- "Amaro" — Italian bittersweet herbal. Fernet-Branca, Averna, Ramazzotti, Cynar, Aperol (technically aperitivo), Campari (technically bitter aperitif).
- "Herbal" — Chartreuse, Bénédictine, Drambuie, Galliano, Strega, Suze.
- "Fruit" — Cointreau, Grand Marnier, Chambord, St-Germain.
- "Cream" — Baileys, RumChata.
- "Coffee" — Kahlúa, Tia Maria, Mr Black.
- "Nut" — Frangelico, Disaronno, Nocino.
- "Anise" — Pernod, Sambuca, Ouzo, Pastis, Ricard.

## vermouth
- "Dry" — Noilly Prat Dry, Dolin Dry.
- "Sweet" — Carpano Antica, Punt e Mes, Cocchi Vermouth di Torino.
- "Bianco" — Dolin Blanc, Carpano Bianco.
- "Rosé" — La Quintinye, Lillet Rosé.
- "Aperitivo" — Lillet Blanc, Cocchi Americano.

## other
Use for absinthe, aquavit, baijiu, soju, shochu, cachaça, eau de vie, etc. Set subtype to null.

# Examples

Input: "Buffalo Trace Bourbon"
Output: {"category":"whiskey","subtype":"Bourbon","proof":90,"age_years":null,"distillery":"Buffalo Trace Distillery","region":"Kentucky, USA","mash_bill":"~78/10/12 corn/rye/malt"}

Input: "Eagle Rare 10 Year"
Output: {"category":"whiskey","subtype":"Bourbon","proof":90,"age_years":10,"distillery":"Buffalo Trace Distillery","region":"Kentucky, USA","mash_bill":"~78/10/12 corn/rye/malt"}

Input: "Lagavulin 16 Year"
Output: {"category":"whiskey","subtype":"Single Malt Scotch","proof":86,"age_years":16,"distillery":"Lagavulin","region":"Islay, Scotland","mash_bill":null}

Input: "Macallan 12 Sherry Oak"
Output: {"category":"whiskey","subtype":"Single Malt Scotch","proof":86,"age_years":12,"distillery":"The Macallan","region":"Speyside, Scotland","mash_bill":null}

Input: "Suntory Whisky Toki, 750.0 ML"
Output: {"category":"whiskey","subtype":"Japanese","proof":86,"age_years":null,"distillery":"Suntory","region":"Japan","mash_bill":null}

Input: "Hibiki Japanese Harmony"
Output: {"category":"whiskey","subtype":"Japanese","proof":86,"age_years":null,"distillery":"Suntory","region":"Japan","mash_bill":null}

Input: "Don Julio 1942"
Output: {"category":"tequila","subtype":"Añejo","proof":80,"age_years":null,"distillery":"Tequila Don Julio","region":"Jalisco, Mexico","mash_bill":null}

Input: "Clase Azul Reposado"
Output: {"category":"tequila","subtype":"Reposado","proof":80,"age_years":null,"distillery":"Clase Azul (produced at Productos Finos de Agave)","region":"Jalisco, Mexico","mash_bill":null}

Input: "Hendrick's Gin"
Output: {"category":"gin","subtype":"Contemporary","proof":88,"age_years":null,"distillery":"Hendrick's","region":"Scotland","mash_bill":null}

Input: "Tanqueray London Dry"
Output: {"category":"gin","subtype":"London Dry","proof":94.6,"age_years":null,"distillery":"Tanqueray","region":"Scotland","mash_bill":null}

Input: "Rémy Martin VSOP"
Output: {"category":"cognac","subtype":"VSOP","proof":80,"age_years":null,"distillery":"Rémy Martin","region":"Cognac, France","mash_bill":null}

Input: "Aperol Aperitivo"
Output: {"category":"liqueur","subtype":"Amaro","proof":22,"age_years":null,"distillery":"Aperol (Campari Group)","region":"Italy","mash_bill":null}

Input: "Carpano Antica Formula"
Output: {"category":"vermouth","subtype":"Sweet","proof":33,"age_years":null,"distillery":"Carpano","region":"Turin, Italy","mash_bill":null}

# Edge cases

- Title strings often include size noise (", 750.0 ML", " 750ml", " 1L"). Ignore size; it doesn't affect classification.
- Distillery vs brand: Eagle Rare's distillery is Buffalo Trace; Pappy is Buffalo Trace; Weller is Buffalo Trace; Blanton's is Buffalo Trace. Hibiki/Toki/Yamazaki/Hakushu are all Suntory but Yamazaki is the actual distillery name when the bottle is Yamazaki — use the matching distillery name when the bottle bears it.
- For unknown or generic store-brand spirits, return category and best-guess subtype but null everything else.
- For obvious non-spirits (food, accessories), return {"category":"other","subtype":null,...all nulls}. The client filters those out.
- Don't fabricate ages, proofs, or mash bills. Null beats wrong.`;

const ENRICHMENT_SCHEMA = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: [
        "whiskey",
        "tequila",
        "mezcal",
        "rum",
        "gin",
        "vodka",
        "cognac",
        "liqueur",
        "vermouth",
        "other",
      ],
    },
    subtype: { type: ["string", "null"] },
    proof: { type: ["number", "null"] },
    age_years: { type: ["integer", "null"] },
    distillery: { type: ["string", "null"] },
    region: { type: ["string", "null"] },
    mash_bill: { type: ["string", "null"] },
  },
  required: [
    "category",
    "subtype",
    "proof",
    "age_years",
    "distillery",
    "region",
    "mash_bill",
  ],
  additionalProperties: false,
} as const;

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
      source: "openfoodfacts" as const,
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
      source: "upcitemdb" as const,
    };
  } catch {
    return null;
  }
}

async function enrichWithClaude(name: string, brand: string | null) {
  if (!anthropic) return null;
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: ENRICHMENT_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: ENRICHMENT_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Name: ${name}\nBrand: ${brand || "(unknown)"}\n\nReturn the enrichment JSON.`,
        },
      ],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    return JSON.parse(block.text);
  } catch (e) {
    console.error(
      "[lookup-upc] enrichment failed:",
      e instanceof Error ? e.message : String(e),
    );
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

  if (hit?.name) {
    const enriched = await enrichWithClaude(hit.name, hit.brand);
    if (enriched) {
      hit = { ...hit, ...enriched };
    }
  }

  return json(hit);
});
