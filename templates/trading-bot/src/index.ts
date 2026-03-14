/**
 * Trading Bot
 *
 * Monitors the Bags token feed for new launches,
 * gets swap quotes, and executes trades via Jito bundles.
 *
 * Environment variables needed:
 * - BAGS_API_KEY         (https://dev.bags.fm)
 * - SOLANA_PRIVATE_KEY   (base58-encoded)
 * - SOLANA_RPC_URL       (Helius recommended)
 */

import { getQuote, executeSwap, getRecentLaunches, getWallet, WSOL } from "./bags-client";

const POLL_INTERVAL_MS = 10_000;
const SEEN_MINTS = new Set<string>();

async function checkForNewLaunches(): Promise<void> {
  try {
    const launches = await getRecentLaunches();

    for (const token of launches) {
      const mint = token.tokenMint as string;
      if (!mint || SEEN_MINTS.has(mint)) continue;
      SEEN_MINTS.add(mint);

      console.log(`New token: ${token.name} (${token.symbol}) - ${mint}`);

      // TODO: Add your strategy here
      // Example: get a quote for 0.1 SOL worth
      // const quote = await getQuote(WSOL, mint, "100000000");
      // const result = await executeSwap(quote);
    }
  } catch (error) {
    console.error("Poll error:", error instanceof Error ? error.message : error);
  }
}

async function main(): Promise<void> {
  const wallet = getWallet();
  console.log(`Bot wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`Polling every ${POLL_INTERVAL_MS / 1000}s...`);

  await checkForNewLaunches();
  setInterval(checkForNewLaunches, POLL_INTERVAL_MS);
}

main();
