#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: analyze
 * Comprehensive analysis of a Bags token: fees, creators, claim stats, pool status.
 *
 * Usage:
 *   npx tsx analyze.ts <token-mint>
 */

import { loadConfig, apiFetch } from "./shared";

interface PoolInfo {
  dbcConfigKey?: string;
  dbcPoolKey?: string;
  dammV2PoolKey?: string;
}

interface ClaimStat {
  claimedLamports?: string;
}

async function main(): Promise<void> {
  const tokenMint = process.argv[2];
  if (!tokenMint) {
    console.error("Usage: npx tsx analyze.ts <token-mint>");
    process.exit(1);
  }

  const config = loadConfig();

  const [creators, lifetimeFees, claimStats, pool] = await Promise.all([
    apiFetch(`/token-launch/creator/v3?tokenMint=${tokenMint}`, config.apiKey),
    apiFetch<string>(`/token-launch/lifetime-fees?tokenMint=${tokenMint}`, config.apiKey),
    apiFetch<ClaimStat[]>(`/token-launch/claim-stats?tokenMint=${tokenMint}`, config.apiKey),
    apiFetch<PoolInfo>(`/solana/bags/pools/token-mint?tokenMint=${tokenMint}`, config.apiKey),
  ]);

  const analysis: Record<string, unknown> = {
    tokenMint,
    lifetimeFees: lifetimeFees ? {
      lamports: lifetimeFees,
      sol: Number(BigInt(lifetimeFees)) / 1e9,
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

  if (claimStats && lifetimeFees) {
    const totalFees = BigInt(lifetimeFees);
    let totalClaimed = BigInt(0);

    if (Array.isArray(claimStats)) {
      for (const stat of claimStats) {
        if (stat.claimedLamports) totalClaimed += BigInt(stat.claimedLamports);
      }
    }

    const unclaimed = totalFees - totalClaimed;
    analysis.feeAnalysis = {
      totalFeesSOL: Number(totalFees) / 1e9,
      totalClaimedSOL: Number(totalClaimed) / 1e9,
      unclaimedSOL: Number(unclaimed) / 1e9,
      claimRate: totalFees > 0n ? ((Number(totalClaimed) / Number(totalFees)) * 100).toFixed(1) + "%" : "N/A",
    };
  }

  console.log(JSON.stringify(analysis, null, 2));
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
