/**
 * Bags API client for token launch platform.
 * Handles token creation, fee config, launch transactions, and Dexscreener integration.
 */

import { BagsClient } from "@bagsfm/bags-sdk";

if (!process.env.BAGS_API_KEY) {
  throw new Error("BAGS_API_KEY environment variable is required");
}

export const bags = new BagsClient({
  apiKey: process.env.BAGS_API_KEY,
});

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

/**
 * Full token launch flow:
 * 1. Create fee share config
 * 2. Create token metadata
 * 3. Create launch transaction
 *
 * Returns all transactions for the user to sign.
 */
export async function prepareLaunch(config: LaunchConfig) {
  // Validate splits
  if (config.claimers.length !== config.splits.length) {
    throw new Error("Claimers and splits must be the same length");
  }
  const total = config.splits.reduce((a, b) => a + b, 0);
  if (total !== 10000) {
    throw new Error(`Splits must total 10,000 bps (got ${total})`);
  }

  // Step 1: Create token metadata
  const tokenInfo = await bags.tokenLaunch.createTokenInfoAndMetadata({
    name: config.name,
    symbol: config.symbol,
    description: config.description,
    imageUrl: config.imageUrl,
    twitter: config.twitter,
    telegram: config.telegram,
    website: config.website,
  });

  // Step 2: Create fee share config
  const feeConfig = await bags.config.createBagsFeeShareConfig({
    payer: config.creatorWallet,
    baseMint: tokenInfo.tokenMint,
    claimersArray: config.claimers,
    basisPointsArray: config.splits,
  });

  // Step 3: Create launch transaction
  const launchTx = await bags.tokenLaunch.createLaunchTransaction({
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
 */
export async function setupDexscreener(tokenMint: string) {
  return bags.dexscreener.checkOrderAvailability(tokenMint);
}
