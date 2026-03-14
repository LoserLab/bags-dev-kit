#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: fees
 * Check claimable fee positions for a wallet address.
 *
 * Usage:
 *   npx tsx fees.ts <wallet-address>
 *   npx tsx fees.ts                      (uses defaultWallet from config)
 */

import { loadConfig, apiFetchOrExit } from "./shared";

interface FeePosition {
  tokenMint?: string;
  type?: string;
  claimableLamports?: string;
}

async function main(): Promise<void> {
  const config = loadConfig();
  const wallet = process.argv[2] || config.defaultWallet;

  if (!wallet) {
    console.error("Usage: npx tsx fees.ts <wallet-address>");
    console.error("Or set defaultWallet in config via /bags-dev-kit:setup");
    process.exit(1);
  }

  const positions = await apiFetchOrExit<FeePosition[] | Record<string, FeePosition>>(
    `/token-launch/claimable-positions?wallet=${wallet}`,
    config.apiKey
  );

  let totalClaimableLamports = BigInt(0);
  const summary: Array<{
    tokenMint: string;
    type: string;
    claimable: number;
    claimableLamports: string;
  }> = [];

  const entries: Array<[string, FeePosition]> = Array.isArray(positions)
    ? positions.map((pos, i) => [String(i), pos])
    : Object.entries(positions);

  for (const [key, pos] of entries) {
    if (pos?.claimableLamports) {
      const lamports = BigInt(pos.claimableLamports);
      totalClaimableLamports += lamports;
      summary.push({
        tokenMint: pos.tokenMint || key,
        type: pos.type || "unknown",
        claimable: Number(lamports) / 1e9,
        claimableLamports: pos.claimableLamports,
      });
    }
  }

  console.log(JSON.stringify({
    wallet,
    totalClaimableSOL: Number(totalClaimableLamports) / 1e9,
    totalClaimableLamports: totalClaimableLamports.toString(),
    positionCount: summary.length,
    positions: summary,
    raw: positions,
  }, null, 2));
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
