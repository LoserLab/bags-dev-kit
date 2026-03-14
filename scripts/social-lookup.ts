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

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const API_BASE = "https://public-api-v2.bags.fm/api/v1";
const CONFIG_PATH = join(homedir(), ".bags-dev-kit", "config.json");
const VALID_PROVIDERS = ["twitter", "tiktok", "kick", "github"];

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    console.error("Config not found. Run /bags-dev-kit:setup first.");
    process.exit(1);
  }
}

async function main() {
  const [, , provider, username] = process.argv;

  if (!provider || !username) {
    console.error("Usage: npx tsx social-lookup.ts <provider> <username>");
    console.error("Providers: twitter, tiktok, kick, github");
    process.exit(1);
  }

  if (!VALID_PROVIDERS.includes(provider.toLowerCase())) {
    console.error(`Invalid provider "${provider}". Use: ${VALID_PROVIDERS.join(", ")}`);
    process.exit(1);
  }

  const config = loadConfig();

  const params = new URLSearchParams({
    username: username.replace(/^@/, ""),
    provider: provider.toLowerCase(),
  });

  const res = await fetch(
    `${API_BASE}/token-launch/fee-share/wallet/v2?${params}`,
    { headers: { "x-api-key": config.apiKey } }
  );

  const data = await res.json();

  if (!data.success) {
    console.error("Lookup failed:", data.error || "Unknown error");
    process.exit(1);
  }

  console.log(JSON.stringify({
    provider: provider.toLowerCase(),
    username: username.replace(/^@/, ""),
    wallet: data.response,
  }, null, 2));
}

main();
