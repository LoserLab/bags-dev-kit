#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: social-lookup
 * Find a Solana wallet address by social media handle.
 *
 * Usage:
 *   npx tsx social-lookup.ts <provider> <username>
 *   npx tsx social-lookup.ts twitter elonmusk
 *   npx tsx social-lookup.ts github octocat
 *
 * Providers: twitter, tiktok, kick, github
 */

import { loadConfig, apiFetchOrExit } from "./shared";

const VALID_PROVIDERS = ["twitter", "tiktok", "kick", "github"] as const;

async function main(): Promise<void> {
  const [, , provider, username] = process.argv;

  if (!provider || !username) {
    console.error("Usage: npx tsx social-lookup.ts <provider> <username>");
    console.error("Providers: twitter, tiktok, kick, github");
    process.exit(1);
  }

  const normalizedProvider = provider.toLowerCase();
  if (!VALID_PROVIDERS.includes(normalizedProvider as typeof VALID_PROVIDERS[number])) {
    console.error(`Invalid provider "${provider}". Use: ${VALID_PROVIDERS.join(", ")}`);
    process.exit(1);
  }

  const config = loadConfig();
  const normalizedUsername = username.replace(/^@/, "");

  const params = new URLSearchParams({
    username: normalizedUsername,
    provider: normalizedProvider,
  });

  const wallet = await apiFetchOrExit(
    `/token-launch/fee-share/wallet/v2?${params}`,
    config.apiKey
  );

  console.log(JSON.stringify({
    provider: normalizedProvider,
    username: normalizedUsername,
    wallet,
  }, null, 2));
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
