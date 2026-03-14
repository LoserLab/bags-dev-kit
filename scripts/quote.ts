#!/usr/bin/env npx tsx

/**
 * bags-dev-kit: quote
 * Get a swap quote from the Bags trading API.
 *
 * Usage:
 *   npx tsx quote.ts <input-mint> <output-mint> <amount> [decimals]
 *   npx tsx quote.ts SOL <token-mint> 1.5
 *   npx tsx quote.ts SOL <token-mint> 1.5 9
 *
 * Amount is in human-readable units (e.g., 1.5 SOL, not lamports).
 * SOL/WSOL is automatically resolved to the wrapped SOL mint.
 * Decimals default to 9 for SOL, 6 for others. Pass explicitly for accuracy.
 */

import { loadConfig, apiFetchOrExit, WSOL } from "./shared";

function resolveMint(input: string): string {
  if (input.toUpperCase() === "SOL" || input.toUpperCase() === "WSOL") return WSOL;
  return input;
}

async function main(): Promise<void> {
  const [, , inputRaw, outputRaw, amountStr, decimalsArg] = process.argv;

  if (!inputRaw || !outputRaw || !amountStr) {
    console.error("Usage: npx tsx quote.ts <input-mint> <output-mint> <amount> [decimals]");
    console.error("Example: npx tsx quote.ts SOL DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263 1.5");
    process.exit(1);
  }

  const config = loadConfig();
  const inputMint = resolveMint(inputRaw);
  const outputMint = resolveMint(outputRaw);

  const inputDecimals = decimalsArg
    ? parseInt(decimalsArg, 10)
    : inputMint === WSOL ? 9 : 6;

  const amount = Math.floor(parseFloat(amountStr) * 10 ** inputDecimals).toString();

  const params = new URLSearchParams({ inputMint, outputMint, amount });

  const quote = await apiFetchOrExit<{
    inAmount: string;
    outAmount: string;
    minOutAmount: string;
    priceImpactPct: string;
    slippageBps: number;
    platformFee: unknown;
    requestId: string;
    routePlan: unknown[];
  }>(`/trade/quote?${params}`, config.apiKey);

  const inAmount = parseInt(quote.inAmount) / 10 ** inputDecimals;
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

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
