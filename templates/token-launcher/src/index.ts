/**
 * Token Launcher Platform
 *
 * Lets creators connect wallets, configure tokens with fee sharing,
 * and handle the full launch flow (metadata, config, transaction).
 *
 * Environment variables needed:
 * - BAGS_API_KEY         (https://dev.bags.fm)
 * - SOLANA_RPC_URL       (Helius recommended)
 * - PLATFORM_WALLET      (your platform's fee-earning wallet)
 * - PLATFORM_FEE_BPS     (platform fee in basis points, e.g. 3000 = 30%)
 */

export { prepareLaunch, checkDexscreenerAvailability, getBagsClient } from "./bags-client";
export type { LaunchConfig, LaunchResult } from "./bags-client";
