/**
 * Bags API client with typed methods and error handling.
 * Server-side only (uses API key from environment).
 */

import { BagsClient } from "@bagsfm/bags-sdk";

const API_BASE = "https://public-api-v2.bags.fm/api/v1";

let _client: BagsClient | null = null;

function getClient(): BagsClient {
  if (!_client) {
    if (!process.env.BAGS_API_KEY) {
      throw new Error("BAGS_API_KEY environment variable is required");
    }
    _client = new BagsClient({ apiKey: process.env.BAGS_API_KEY });
  }
  return _client;
}

/**
 * Create a fee share configuration for a new token.
 *
 * @param payer - Wallet address paying for the transaction
 * @param baseMint - Token mint address
 * @param claimers - Array of wallet addresses that will earn fees
 * @param splits - Array of basis points (must total 10,000)
 */
export function createFeeShareConfig(
  payer: string,
  baseMint: string,
  claimers: string[],
  splits: number[]
): ReturnType<BagsClient["config"]["createBagsFeeShareConfig"]> {
  if (claimers.length !== splits.length) {
    throw new Error("Claimers and splits arrays must be the same length");
  }
  if (splits.reduce((a, b) => a + b, 0) !== 10000) {
    throw new Error("Splits must total exactly 10,000 basis points");
  }

  return getClient().config.createBagsFeeShareConfig({
    payer,
    baseMint,
    claimersArray: claimers,
    basisPointsArray: splits,
  });
}

/**
 * Look up a wallet address by social media handle.
 * Uses raw fetch because this endpoint is not covered by the SDK.
 */
export async function socialLookup(provider: string, username: string): Promise<unknown> {
  if (!process.env.BAGS_API_KEY) {
    throw new Error("BAGS_API_KEY environment variable is required");
  }
  const params = new URLSearchParams({
    username: username.replace(/^@/, ""),
    provider: provider.toLowerCase(),
  });
  const res = await fetch(
    `${API_BASE}/token-launch/fee-share/wallet/v2?${params}`,
    { headers: { "x-api-key": process.env.BAGS_API_KEY } }
  );
  if (!res.ok) throw new Error(`Social lookup failed (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Social lookup failed");
  return data.response;
}

/**
 * Access the Bags SDK client directly for operations not wrapped above.
 * Use bags.trade.getQuote(), bags.fee.getAllClaimablePositions(), etc.
 */
export { getClient as getBagsClient };
