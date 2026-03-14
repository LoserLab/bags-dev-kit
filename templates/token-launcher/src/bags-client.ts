/**
 * Bags API client for token launch platform.
 * Handles token creation, fee config, launch transactions, and Dexscreener integration.
 */

import { BagsClient } from "@bagsfm/bags-sdk";

const API_BASE = "https://public-api-v2.bags.fm/api/v1";

let _client: BagsClient | null = null;

function getClient(): BagsClient {
  if (!process.env.BAGS_API_KEY) {
    throw new Error("BAGS_API_KEY environment variable is required");
  }
  if (!_client) {
    _client = new BagsClient({ apiKey: process.env.BAGS_API_KEY });
  }
  return _client;
}

export interface LaunchConfig {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  claimers: string[];
  splits: number[];
  creatorWallet: string;
  initialBuyLamports?: string;
}

export interface LaunchResult {
  tokenMint: string;
  metadata: string;
  feeShareAuthority: string;
  configKey: string;
  transactions: unknown[];
}

/**
 * Full token launch flow:
 * 1. Create token metadata (gets tokenMint)
 * 2. Create fee share config (uses tokenMint)
 * 3. Create launch transaction
 *
 * Returns all transactions for the user to sign.
 */
export async function prepareLaunch(config: LaunchConfig): Promise<LaunchResult> {
  if (config.claimers.length !== config.splits.length) {
    throw new Error("Claimers and splits must be the same length");
  }
  const total = config.splits.reduce((a, b) => a + b, 0);
  if (total !== 10000) {
    throw new Error(`Splits must total 10,000 bps (got ${total})`);
  }

  const client = getClient();

  const tokenInfo = await client.tokenLaunch.createTokenInfoAndMetadata({
    name: config.name,
    symbol: config.symbol,
    description: config.description,
    imageUrl: config.imageUrl,
    twitter: config.twitter,
    telegram: config.telegram,
    website: config.website,
  });

  const feeConfig = await client.config.createBagsFeeShareConfig({
    payer: config.creatorWallet,
    baseMint: tokenInfo.tokenMint,
    claimersArray: config.claimers,
    basisPointsArray: config.splits,
  });

  const launchTx = await client.tokenLaunch.createLaunchTransaction({
    ipfs: tokenInfo.tokenMetadata,
    tokenMint: tokenInfo.tokenMint,
    wallet: config.creatorWallet,
    initialBuyLamports: config.initialBuyLamports || "0",
    configKey: feeConfig.meteoraConfigKey,
  });

  return {
    tokenMint: tokenInfo.tokenMint,
    metadata: tokenInfo.tokenMetadata,
    feeShareAuthority: feeConfig.feeShareAuthority,
    configKey: feeConfig.meteoraConfigKey,
    transactions: [
      ...(feeConfig.transactions || []),
      launchTx,
    ],
  };
}

/**
 * Check if Dexscreener token info is available for a launched token.
 * Uses raw fetch because this endpoint is not covered by the SDK.
 */
export async function checkDexscreenerAvailability(tokenMint: string): Promise<unknown> {
  if (!process.env.BAGS_API_KEY) {
    throw new Error("BAGS_API_KEY environment variable is required");
  }
  const res = await fetch(
    `${API_BASE}/solana/dexscreener/order-availability?tokenAddress=${tokenMint}`,
    { headers: { "x-api-key": process.env.BAGS_API_KEY } }
  );
  if (!res.ok) throw new Error(`Dexscreener check failed (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Dexscreener check failed");
  return data.response;
}

export { getClient as getBagsClient };
