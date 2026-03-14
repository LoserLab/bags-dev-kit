/**
 * Trading Bot - Entry Point
 *
 * This template creates a trading bot that:
 * 1. Monitors the Bags token feed for new launches
 * 2. Gets swap quotes for potential trades
 * 3. Executes trades via Jito bundles (MEV-protected)
 *
 * Customize the strategy in this file.
 *
 * Environment variables needed:
 * - BAGS_API_KEY          Your Bags API key
 * - SOLANA_PRIVATE_KEY    Base58-encoded private key
 * - SOLANA_RPC_URL        Helius or other Solana RPC endpoint
 */

import { swap, getRecentLaunches, wallet, WSOL } from "./bags-client";

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const SEEN_MINTS = new Set<string>();

async function checkForNewLaunches() {
  try {
    const launches = await getRecentLaunches();

    for (const token of launches) {
      if (SEEN_MINTS.has(token.tokenMint)) continue;
      SEEN_MINTS.add(token.tokenMint);

      console.log(`New token: ${token.name} (${token.symbol}) - ${token.tokenMint}`);

      // TODO: Add your strategy here
      // Example: get a quote for 0.1 SOL worth
      // const result = await swap(WSOL, token.tokenMint, "100000000", false);
    }
  } catch (error) {
    console.error("Poll error:", error);
  }
}

async function main() {
  console.log(`Bot wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`Polling every ${POLL_INTERVAL_MS / 1000}s...`);

  // Initial check
  await checkForNewLaunches();

  // Poll loop
  setInterval(checkForNewLaunches, POLL_INTERVAL_MS);
}

main();
