import { NextResponse } from "next/server";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export interface CoinLinks {
  homepage?: string;
  twitter?: string;
  telegram?: string;
  reddit?: string;
  github?: string;
  blockchain_explorer?: string;
  whitepaper?: string;
}

/**
 * Fetches profile links from CoinGecko for a coin.
 * Returns direct URLs so users don't need to visit CoinGecko.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "COINGECKO_API_KEY required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
      { headers: { "x-cg-demo-api-key": apiKey } }
    );

    if (res.status === 429) {
      return NextResponse.json(
        { error: "CoinGecko rate limited" },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Coin not found" },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    const data = await res.json();
    const links = data?.links ?? {};

    const result: CoinLinks = {};

    const homepage = links.homepage;
    if (Array.isArray(homepage) && homepage.length > 0 && homepage[0]) {
      result.homepage = homepage[0];
    } else if (typeof homepage === "string") {
      result.homepage = homepage;
    }

    const twitter = links.twitter_screen_name;
    if (twitter && typeof twitter === "string") {
      result.twitter = `https://twitter.com/${twitter.replace(/^@/, "")}`;
    }

    const telegram = links.telegram_channel_identifier;
    if (telegram && typeof telegram === "string") {
      result.telegram = `https://t.me/${telegram.replace(/^@/, "")}`;
    }

    const reddit = links.subreddit_url;
    if (reddit && typeof reddit === "string") {
      result.reddit = reddit;
    }

    const repos = links.repos_url;
    if (repos?.github && Array.isArray(repos.github) && repos.github[0]) {
      result.github = repos.github[0];
    }

    const blockchain = links.blockchain_site;
    if (Array.isArray(blockchain) && blockchain.length > 0 && blockchain[0]) {
      result.blockchain_explorer = blockchain[0];
    }

    const whitepaper = links.whitepaper;
    if (Array.isArray(whitepaper) && whitepaper.length > 0 && whitepaper[0]) {
      result.whitepaper = whitepaper[0];
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 502 }
    );
  }
}
