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
    if (args[i] === "--migrated") flags.migrated = true;
    else if (args[i] === "--token" && args[i + 1]) flags.token = args[++i];
  }
  return flags;
}

async function main() {
  const config = loadConfig();
  const flags = parseArgs();

  if (flags.token) {
    // Single token lookup
    const res = await fetch(
      `${API_BASE}/solana/bags/pools/token-mint?tokenMint=${flags.token}`,
      { headers: { "x-api-key": config.apiKey } }
    );
    const data = await res.json();
    if (!data.success) {
      console.error("Pool lookup failed:", data.error || "Unknown error");
      process.exit(1);
    }
    console.log(JSON.stringify(data.response, null, 2));
  } else {
    // List all pools
    const params = new URLSearchParams();
    if (flags.migrated) params.set("onlyMigrated", "true");

    const url = `${API_BASE}/solana/bags/pools${params.toString() ? "?" + params : ""}`;
    const res = await fetch(url, {
      headers: { "x-api-key": config.apiKey },
    });
    const data = await res.json();
    if (!data.success) {
      console.error("Pool list failed:", data.error || "Unknown error");
      process.exit(1);
    }

    const pools = data.response;
    console.log(JSON.stringify({
      count: Array.isArray(pools) ? pools.length : 0,
      pools,
    }, null, 2));
  }
}

main();
