#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: token-info
 * Get token launch feed or details about a specific token.
 *
 * Usage:
 *   npx tsx token-info.ts --feed                  Recent launches
 *   npx tsx token-info.ts --mint <token-mint>     Specific token creators
 *   npx tsx token-info.ts --top                   Top tokens by lifetime fees
 */

import { loadConfig, apiFetch, apiFetchOrExit } from "./shared";

interface TokenFeedItem {
  name?: string;
  symbol?: string;
  tokenMint?: string;
  status?: string;
  description?: string;
  image?: string;
}

function parseArgs(): Record<string, string | boolean> {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--feed") flags.feed = true;
    else if (args[i] === "--top") flags.top = true;
    else if (args[i] === "--mint" && args[i + 1]) flags.mint = args[++i];
  }
  return flags;
}

async function main(): Promise<void> {
  const config = loadConfig();
  const flags = parseArgs();

  if (flags.mint) {
    const mint = flags.mint as string;
    const [creators, feesRaw] = await Promise.all([
      apiFetch(`/token-launch/creator/v3?tokenMint=${mint}`, config.apiKey),
      apiFetch<string>(`/token-launch/lifetime-fees?tokenMint=${mint}`, config.apiKey),
    ]);

    console.log(JSON.stringify({
      tokenMint: mint,
      creators,
      lifetimeFees: feesRaw ? {
        lamports: feesRaw,
        sol: Number(BigInt(feesRaw)) / 1e9,
      } : null,
    }, null, 2));
  } else if (flags.top) {
    const topTokens = await apiFetchOrExit(`/token-launch/top-tokens/lifetime-fees`, config.apiKey);
    console.log(JSON.stringify(topTokens, null, 2));
  } else {
    const tokens = await apiFetchOrExit<TokenFeedItem[]>(`/token-launch/feed`, config.apiKey);

    if (Array.isArray(tokens)) {
      console.log(JSON.stringify({
        count: tokens.length,
        tokens: tokens.map((t) => ({
          name: t.name,
          symbol: t.symbol,
          mint: t.tokenMint,
          status: t.status,
          description: t.description?.slice(0, 100),
          image: t.image,
        })),
      }, null, 2));
    } else {
      console.log(JSON.stringify(tokens, null, 2));
    }
  }
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
