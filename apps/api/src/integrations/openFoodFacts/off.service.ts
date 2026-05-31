// Open Food Facts – free & open-source global food database
// No API key required. Has strong Indian packaged food & recipe data.
// Docs: https://wiki.openfoodfacts.org/API

const BASE_URL = "https://world.openfoodfacts.org";
const USER_AGENT = "FoodTrackerApp/1.0 (contact@example.com)"; // OFF recommends a UA

export interface OFFNormalizedFood {
  offId: string;        // barcode / _id
  name: string;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  servingSizeG: number | null;
}

interface OFFProduct {
  _id?: string;
  id?: string;
  product_name?: string;
  product_name_en?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
  serving_size?: string;
}

interface OFFSearchResponse {
  products: OFFProduct[];
  count: number;
}

function parseServingG(servingSize?: string): number | null {
  if (!servingSize) return null;
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? parseFloat(match[1]) : null;
}

function normalizeOFFProduct(p: OFFProduct): OFFNormalizedFood | null {
  const name = (p.product_name_en ?? p.product_name ?? "").trim();
  if (!name) return null;

  const n = p.nutriments ?? {};
  const kcal = n["energy-kcal_100g"] ?? n["energy-kcal"] ?? null;
  if (!kcal || kcal <= 0) return null;

  return {
    offId: (p._id ?? p.id ?? name).toString(),
    name,
    caloriesPer100g: kcal,
    proteinPer100g: n.proteins_100g ?? null,
    carbsPer100g: n.carbohydrates_100g ?? null,
    fatPer100g: n.fat_100g ?? null,
    fiberPer100g: n.fiber_100g ?? null,
    servingSizeG: parseServingG(p.serving_size),
  };
}

export async function searchOpenFoodFacts(
  query: string,
  pageSize = 5
): Promise<OFFNormalizedFood[]> {
  const url = new URL(`${BASE_URL}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set(
    "fields",
    "id,_id,product_name,product_name_en,nutriments,serving_size"
  );

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts error: ${response.status}`);
  }

  const data = (await response.json()) as OFFSearchResponse;

  return (data.products ?? [])
    .map(normalizeOFFProduct)
    .filter((f): f is OFFNormalizedFood => f !== null)
    .slice(0, pageSize);
}
