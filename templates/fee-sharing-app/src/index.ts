/**
 * Fee Sharing App - Entry Point
 *
 * This template creates a Next.js app that:
 * 1. Lets users connect wallets via Privy
 * 2. Launch tokens with fee sharing configured
 * 3. Track and claim accumulated fees
 *
 * Start here and customize for your use case.
 *
 * Key files:
 * - src/bags-client.ts    Typed Bags API client
 * - src/index.ts          This file (app overview)
 * - .env.local            API keys and config
 *
 * Environment variables needed:
 * - BAGS_API_KEY          Your Bags API key (https://dev.bags.fm)
 * - NEXT_PUBLIC_PRIVY_APP_ID   Privy app ID for wallet connection
 * - SOLANA_RPC_URL        Helius or other Solana RPC endpoint
 */

export { bags, createFeeShareConfig, getQuote, getClaimablePositions, getLifetimeFees, socialLookup } from "./bags-client";
