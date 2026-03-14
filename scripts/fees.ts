#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: fees
 * Check claimable fee positions for a wallet address.
 *
 * Usage:
 *   npx tsx fees.ts <wallet-address>
 *   npx tsx fees.ts                      (uses defaultWallet from config)
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

async function main() {
  const config = loadConfig();
  const wallet = process.argv[2] || config.defaultWallet;

  if (!wallet) {
    console.error("Usage: npx tsx fees.ts <wallet-address>");
    console.error("Or set defaultWallet in config via /bags-dev-kit:setup");
    process.exit(1);
  }

  const res = await fetch(
    `${API_BASE}/token-launch/claimable-positions?wallet=${wallet}`,
    { headers: { "x-api-key": config.apiKey } }
  );

  const data = await res.json();

  if (!data.success) {
    console.error("Failed to fetch fees:", data.error || "Unknown error");
    process.exit(1);
  }

  const positions = data.response;

  // Calculate totals
  let totalClaimableLamports = 0;
  const summary: Array<{
    tokenMint: string;
    type: string;
    claimable: number;
    claimableLamports: string;
  }> = [];

  if (positions && typeof positions === "object") {
    for (const [key, pos] of Object.entries(positions as Record<string, any>)) {
      if (pos && pos.claimableLamports) {
        const lamports = parseInt(pos.claimableLamports);
        totalClaimableLamports += lamports;
        summary.push({
          tokenMint: pos.tokenMint || key,
          type: pos.type || "unknown",
          claimable: lamports / 1e9,
          claimableLamports: pos.claimableLamports,
        });
      }
    }
  }

  console.log(JSON.stringify({
    wallet,
    totalClaimableSOL: totalClaimableLamports / 1e9,
    totalClaimableLamports: totalClaimableLamports.toString(),
    positionCount: summary.length,
    positions: summary,
    raw: positions,
  }, null, 2));
}

main();
