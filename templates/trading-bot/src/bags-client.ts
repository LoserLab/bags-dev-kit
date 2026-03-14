/**
 * Bags API client for trading bot operations.
 * Includes quote fetching, swap execution, and Jito bundle submission.
 */

import { BagsClient } from "@bagsfm/bags-sdk";
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

if (!process.env.BAGS_API_KEY) {
  throw new Error("BAGS_API_KEY environment variable is required");
}
if (!process.env.SOLANA_PRIVATE_KEY) {
  throw new Error("SOLANA_PRIVATE_KEY environment variable is required");
}

export const bags = new BagsClient({
  apiKey: process.env.BAGS_API_KEY,
});

export const wallet = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY)
);

export const WSOL = "So11111111111111111111111111111111111111112";

/**
 * Get a swap quote and optionally execute it.
 */
export async function swap(
  inputMint: string,
  outputMint: string,
  amountLamports: string,
  execute = false
) {
  // Get quote
  const quote = await bags.trade.getQuote({
    inputMint,
    outputMint,
    amount: amountLamports,
  });

  console.log(`Quote: ${quote.inAmount} -> ${quote.outAmount} (impact: ${quote.priceImpactPct}%)`);

  if (!execute) return { quote, executed: false };

  // Create swap transaction
  const { swapTransaction } = await bags.trade.createSwapTransaction({
    quoteResponse: quote,
    userPublicKey: wallet.publicKey.toBase58(),
  });

  // Deserialize, sign, and submit via Jito
  const txBuffer = Buffer.from(swapTransaction, "base64");
  const tx = VersionedTransaction.deserialize(txBuffer);
  tx.sign([wallet]);

  const serialized = Buffer.from(tx.serialize()).toString("base64");

  const bundleId = await bags.solana.sendBundle({
    transactions: [serialized],
    region: "mainnet",
  });

  console.log(`Bundle submitted: ${bundleId}`);

  return { quote, executed: true, bundleId };
}

/**
 * Check token feed for new launches.
 */
export async function getRecentLaunches() {
  const response = await fetch("https://public-api-v2.bags.fm/api/v1/token-launch/feed", {
    headers: { "x-api-key": process.env.BAGS_API_KEY! },
  });
  const data = await response.json();
  return data.success ? data.response : [];
}
