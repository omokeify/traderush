import { createClient } from "@supabase/supabase-js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Free plan: ~30 calls/min. 2 pages + 6s delay = safe. Set COINGECKO_MAX_PAGES=4 for 1000 coins.
const MAX_PAGES = Math.min(parseInt(process.env.COINGECKO_MAX_PAGES || "2", 10), 4);
const DELAY_MS = 6000; // 6s between requests (~10/min, under 30 limit)

function getCoinGeckoConfig() {
  const apiKey = process.env.COINGECKO_API_KEY;
  return {
    baseUrl: "https://api.coingecko.com/api/v3",
    header: "x-cg-demo-api-key" as const,
    apiKey,
  };
}

async function fetchPage(
  url: string,
  params: URLSearchParams,
  headers: Record<string, string>,
  retries = 1
): Promise<Response> {
  const res = await fetch(`${url}?${params}`, { headers });
  if (res.status === 429 && retries > 0) {
    await sleep(65000); // Wait for rate limit window to reset
    return fetchPage(url, params, headers, 0);
  }
  return res;
}

export interface RefreshOptions {
  category?: string; // e.g. "artificial-intelligence", "real-world-assets", "layer-1"
}

export async function refreshCoins(options: RefreshOptions = {}): Promise<{ count: number; error?: string }> {
  const { baseUrl, header, apiKey } = getCoinGeckoConfig();
  if (!apiKey) {
    return {
      count: 0,
      error:
        "COINGECKO_API_KEY required. Get free key at https://www.coingecko.com/en/api/pricing",
    };
  }

  const url = `${baseUrl}/coins/markets`;

  const allCoins: Array<{
    id: string;
    symbol: string;
    name: string;
    market_cap_rank: number | null;
    current_price: number | null;
    image?: string;
    categories?: string[];
  }> = [];

  const headers: Record<string, string> = {};
  if (apiKey) headers[header] = apiKey;

  const maxPages = options.category ? 2 : MAX_PAGES; // Category fetch: fewer pages (rate limit)

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: "250",
      page: String(page),
      sparkline: "false",
    });
    if (options.category) params.set("category", options.category);
    if (apiKey) params.set("x_cg_demo_api_key", apiKey);

    const res = await fetchPage(url, params, headers);

    if (res.status === 429) {
      return {
        count: 0,
        error:
          "CoinGecko rate limit (429). Add COINGECKO_API_KEY.",
      };
    }

    if (!res.ok) {
      return { count: 0, error: `CoinGecko API error: ${res.status}` };
    }

    const data = await res.json();

    if (page < maxPages) await sleep(DELAY_MS);
    allCoins.push(
      ...data.map(
        (c: {
          id: string;
          symbol: string;
          name: string;
          market_cap_rank: number | null;
          current_price: number | null;
          image?: string;
        }) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          market_cap_rank: c.market_cap_rank,
          current_price: c.current_price,
          image: c.image,
        })
      )
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const categoryId = options.category || null;
  const categoryName = options.category
    ? options.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  const rows = allCoins.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    market_cap_rank: c.market_cap_rank,
    current_price: c.current_price,
    image: c.image,
    category_id: categoryId,
    category_name: categoryName,
    last_updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("coins").upsert(rows, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: rows.length };
}
