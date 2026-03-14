/**
 * Token Launcher Platform - Entry Point
 *
 * This template creates a token launch platform that:
 * 1. Lets creators connect wallets and configure tokens
 * 2. Sets up fee sharing with custom splits
 * 3. Handles the full launch flow (metadata, config, transaction)
 * 4. Integrates with Dexscreener for token visibility
 *
 * Key files:
 * - src/bags-client.ts    Token launch API client
 * - src/index.ts          This file (app overview)
 * - .env.local            API keys and config
 *
 * Environment variables needed:
 * - BAGS_API_KEY                Your Bags API key
 * - NEXT_PUBLIC_PRIVY_APP_ID    Privy app ID
 * - SOLANA_RPC_URL              Helius or other RPC
 * - PLATFORM_WALLET             Your platform's fee-earning wallet
 * - PLATFORM_FEE_BPS            Platform fee in basis points (e.g., 3000 = 30%)
 */

export { bags, prepareLaunch, checkDexscreenerAvailability } from "./bags-client";
export type { LaunchConfig } from "./bags-client";
