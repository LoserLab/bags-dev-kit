#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: quote
 * Get a swap quote from the Bags trading API.
 *
 * Usage:
 *   npx tsx quote.ts <input-mint> <output-mint> <amount>
 *   npx tsx quote.ts SOL <token-mint> 1.5
 *
 * Amount is in human-readable units (e.g., 1.5 SOL, not lamports).
 * SOL is automatically resolved to the wrapped SOL mint.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const WSOL = "So11111111111111111111111111111111111111112";
const API_BASE = "https://public-api-v2.bags.fm/api/v1";
const CONFIG_PATH = join(homedir(), ".bags-dev-kit", "config.json");

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    console.error("Config not found. Run /bags-dev-kit:setup first.");
    process.exit(1);
  }
}

function resolveMint(input: string): string {
  if (input.toUpperCase() === "SOL" || input.toUpperCase() === "WSOL") return WSOL;
  return input;
}

async function main() {
  const [, , inputRaw, outputRaw, amountStr] = process.argv;

  if (!inputRaw || !outputRaw || !amountStr) {
    console.error("Usage: npx tsx quote.ts <input-mint> <output-mint> <amount>");
    console.error("Example: npx tsx quote.ts SOL DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263 1.5");
    process.exit(1);
  }

  const config = loadConfig();
  const inputMint = resolveMint(inputRaw);
  const outputMint = resolveMint(outputRaw);

  // Convert human amount to lamports/smallest unit (assume 9 decimals for SOL, 6 for tokens)
  const decimals = inputMint === WSOL ? 9 : 6;
  const amount = Math.floor(parseFloat(amountStr) * 10 ** decimals).toString();

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
  });

  const res = await fetch(`${API_BASE}/trade/quote?${params}`, {
    headers: { "x-api-key": config.apiKey },
  });

  const data = await res.json();

  if (!data.success) {
    console.error("Quote failed:", data.error || "Unknown error");
    process.exit(1);
  }

  const quote = data.response;

  // Format output
  const inAmount = parseInt(quote.inAmount) / 10 ** decimals;
  const outDecimals = outputMint === WSOL ? 9 : 6;
  const outAmount = parseInt(quote.outAmount) / 10 ** outDecimals;
  const minOut = parseInt(quote.minOutAmount) / 10 ** outDecimals;

  console.log(JSON.stringify({
    input: { mint: inputMint, amount: inAmount, raw: quote.inAmount },
    output: { mint: outputMint, amount: outAmount, raw: quote.outAmount },
    minOutput: { amount: minOut, raw: quote.minOutAmount },
    priceImpact: quote.priceImpactPct,
    slippageBps: quote.slippageBps,
    platformFee: quote.platformFee,
    requestId: quote.requestId,
    routePlan: quote.routePlan,
  }, null, 2));
}

main();
