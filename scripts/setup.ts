#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: setup
 * Saves API key and optional default wallet to ~/.bags-dev-kit/config.json
 *
 * Usage:
 *   npx tsx setup.ts <api-key> [wallet-address]
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".bags-dev-kit");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

function main() {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error("Usage: npx tsx setup.ts <api-key> [wallet-address]");
    console.error("\nGet your API key at https://dev.bags.fm");
    process.exit(1);
  }

  const wallet = process.argv[3] || null;

  // Load existing config if present
  let config: Record<string, unknown> = {};
  if (existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    } catch {
      // Start fresh if corrupt
    }
  }

  config.apiKey = apiKey;
  if (wallet) config.defaultWallet = wallet;
  config.configuredAt = new Date().toISOString();

  mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  chmodSync(CONFIG_PATH, 0o600);

  console.log(JSON.stringify({
    success: true,
    configPath: CONFIG_PATH,
    hasWallet: !!wallet,
    message: "Bags Dev Kit configured. You're ready to build."
  }, null, 2));
}

main();
