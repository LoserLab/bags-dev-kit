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

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const API_BASE = "https://public-api-v2.bags.fm/api/v1";
const CONFIG_PATH = join(homedir(), ".bags-dev-kit", "config.json");

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    console.error("Config not found. Run /bags-dev-kit:setup first.");
    process.exit(1);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--feed") flags.feed = true;
    else if (args[i] === "--top") flags.top = true;
    else if (args[i] === "--mint" && args[i + 1]) flags.mint = args[++i];
  }
  return flags;
}

async function main() {
  const config = loadConfig();
  const flags = parseArgs();
  const headers = { "x-api-key": config.apiKey };

  if (flags.mint) {
    // Get creators for a specific token
    const [creatorsRes, feesRes] = await Promise.all([
      fetch(`${API_BASE}/token-launch/creator/v3?tokenMint=${flags.mint}`, { headers }),
      fetch(`${API_BASE}/token-launch/lifetime-fees?tokenMint=${flags.mint}`, { headers }),
    ]);

    const creators = await creatorsRes.json();
    const fees = await feesRes.json();

    console.log(JSON.stringify({
      tokenMint: flags.mint,
      creators: creators.success ? creators.response : null,
      lifetimeFees: fees.success ? {
        lamports: fees.response,
        sol: parseInt(fees.response as string) / 1e9,
      } : null,
    }, null, 2));
  } else if (flags.top) {
    const res = await fetch(`${API_BASE}/token-launch/top-tokens/lifetime-fees`, { headers });
    const data = await res.json();
    if (!data.success) {
      console.error("Failed:", data.error || "Unknown error");
      process.exit(1);
    }
    console.log(JSON.stringify(data.response, null, 2));
  } else {
    // Default: feed
    const res = await fetch(`${API_BASE}/token-launch/feed`, { headers });
    const data = await res.json();
    if (!data.success) {
      console.error("Failed:", data.error || "Unknown error");
      process.exit(1);
    }

    const tokens = data.response;
    if (Array.isArray(tokens)) {
      console.log(JSON.stringify({
        count: tokens.length,
        tokens: tokens.map((t: any) => ({
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
