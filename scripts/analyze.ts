#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: analyze
 * Comprehensive analysis of a Bags token: fees, creators, claim stats, pool status.
 *
 * Usage:
 *   npx tsx analyze.ts <token-mint>
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

async function safeFetch(url: string, headers: Record<string, string>) {
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    return data.success ? data.response : null;
  } catch {
    return null;
  }
}

async function main() {
  const tokenMint = process.argv[2];
  if (!tokenMint) {
    console.error("Usage: npx tsx analyze.ts <token-mint>");
    process.exit(1);
  }

  const config = loadConfig();
  const headers = { "x-api-key": config.apiKey };

  // Fetch everything in parallel
  const [creators, lifetimeFees, claimStats, pool] = await Promise.all([
    safeFetch(`${API_BASE}/token-launch/creator/v3?tokenMint=${tokenMint}`, headers),
    safeFetch(`${API_BASE}/token-launch/lifetime-fees?tokenMint=${tokenMint}`, headers),
    safeFetch(`${API_BASE}/token-launch/claim-stats?tokenMint=${tokenMint}`, headers),
    safeFetch(`${API_BASE}/solana/bags/pools/token-mint?tokenMint=${tokenMint}`, headers),
  ]);

  const analysis: Record<string, unknown> = {
    tokenMint,
    lifetimeFees: lifetimeFees ? {
      lamports: lifetimeFees,
      sol: parseInt(lifetimeFees as string) / 1e9,
    } : null,
    creators,
    claimStats,
    pool: pool ? {
      dbcConfigKey: pool.dbcConfigKey,
      dbcPoolKey: pool.dbcPoolKey,
      dammV2PoolKey: pool.dammV2PoolKey,
      isMigrated: !!pool.dammV2PoolKey,
    } : null,
  };

  // Calculate fee efficiency if we have claim stats
  if (claimStats && lifetimeFees) {
    const totalFees = parseInt(lifetimeFees as string);
    let totalClaimed = 0;

    if (Array.isArray(claimStats)) {
      for (const stat of claimStats) {
        if (stat.claimedLamports) totalClaimed += parseInt(stat.claimedLamports);
      }
    }

    const unclaimed = totalFees - totalClaimed;
    analysis.feeAnalysis = {
      totalFeesSOL: totalFees / 1e9,
      totalClaimedSOL: totalClaimed / 1e9,
      unclaimedSOL: unclaimed / 1e9,
      claimRate: totalFees > 0 ? ((totalClaimed / totalFees) * 100).toFixed(1) + "%" : "N/A",
    };
  }

  console.log(JSON.stringify(analysis, null, 2));
}

main();
