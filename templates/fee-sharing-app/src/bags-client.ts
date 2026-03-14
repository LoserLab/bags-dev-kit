/**
 * Bags API client with typed methods and error handling.
 * Server-side only (uses API key from environment).
 */

import { BagsClient } from "@bagsfm/bags-sdk";

if (!process.env.BAGS_API_KEY) {
  throw new Error("BAGS_API_KEY environment variable is required");
}

export const bags = new BagsClient({
  apiKey: process.env.BAGS_API_KEY,
});

/**
 * Create a fee share configuration for a new token.
 *
 * @param payer - Wallet address paying for the transaction
 * @param baseMint - Token mint address
 * @param claimers - Array of wallet addresses that will earn fees
 * @param splits - Array of basis points (must total 10,000)
 */
export async function createFeeShareConfig(
  payer: string,
  baseMint: string,
  claimers: string[],
  splits: number[]
) {
  if (claimers.length !== splits.length) {
    throw new Error("Claimers and splits arrays must be the same length");
  }
  if (splits.reduce((a, b) => a + b, 0) !== 10000) {
    throw new Error("Splits must total exactly 10,000 basis points");
  }

  return bags.config.createBagsFeeShareConfig({
    payer,
    baseMint,
    claimersArray: claimers,
    basisPointsArray: splits,
  });
}

/**
 * Get a swap quote.
 */
export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: string
) {
  return bags.trade.getQuote({ inputMint, outputMint, amount });
}

/**
 * Get all claimable fee positions for a wallet.
 */
export async function getClaimablePositions(wallet: string) {
  return bags.fee.getAllClaimablePositions(wallet);
}

/**
 * Get lifetime fees for a token.
 */
export async function getLifetimeFees(tokenMint: string) {
  return bags.state.getTokenLifetimeFees(tokenMint);
}

/**
 * Look up a wallet address by social media handle.
 * Uses raw fetch since this endpoint is not in the SDK.
 */
export async function socialLookup(provider: string, username: string) {
  const params = new URLSearchParams({
    username: username.replace(/^@/, ""),
    provider: provider.toLowerCase(),
  });
  const res = await fetch(
    `https://public-api-v2.bags.fm/api/v1/token-launch/fee-share/wallet/v2?${params}`,
    { headers: { "x-api-key": process.env.BAGS_API_KEY! } }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Social lookup failed");
  return data.response;
}
