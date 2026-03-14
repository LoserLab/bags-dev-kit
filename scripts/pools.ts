#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: pools
 * List Bags pools or look up a specific token's pool.
 *
 * Usage:
 *   npx tsx pools.ts                          List all pools
 *   npx tsx pools.ts --migrated               Only migrated pools (DAMM v2)
 *   npx tsx pools.ts --token <mint>           Look up specific token
 */

import { loadConfig, apiFetchOrExit } from "./shared";

function parseArgs(): Record<string, string | boolean> {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--migrated") flags.migrated = true;
    else if (args[i] === "--token" && args[i + 1]) flags.token = args[++i];
  }
  return flags;
}

async function main(): Promise<void> {
  const config = loadConfig();
  const flags = parseArgs();

  if (flags.token) {
    const pool = await apiFetchOrExit(
      `/solana/bags/pools/token-mint?tokenMint=${flags.token}`,
      config.apiKey
    );
    console.log(JSON.stringify(pool, null, 2));
  } else {
    const params = new URLSearchParams();
    if (flags.migrated) params.set("onlyMigrated", "true");

    const queryStr = params.toString();
    const pools = await apiFetchOrExit<unknown[]>(
      `/solana/bags/pools${queryStr ? "?" + queryStr : ""}`,
      config.apiKey
    );

    console.log(JSON.stringify({
      count: Array.isArray(pools) ? pools.length : 0,
      pools,
    }, null, 2));
  }
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
