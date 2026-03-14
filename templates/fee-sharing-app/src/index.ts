/**
 * Fee Sharing App
 *
 * Next.js app that lets users connect wallets, launch tokens
 * with fee sharing, and track/claim accumulated fees.
 *
 * Environment variables needed:
 * - BAGS_API_KEY         (https://dev.bags.fm)
 * - SOLANA_RPC_URL       (Helius recommended)
 */

export { createFeeShareConfig, socialLookup, getBagsClient } from "./bags-client";
