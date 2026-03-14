/**
 * Bags API client for trading bot operations.
 * Includes quote fetching, swap execution, and Jito bundle submission.
 */

import { BagsClient } from "@bagsfm/bags-sdk";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

export const WSOL = "So11111111111111111111111111111111111111112";

let _client: BagsClient | null = null;
let _wallet: Keypair | null = null;
let _connection: Connection | null = null;

function getClient(): BagsClient {
  if (!_client) {
    if (!process.env.BAGS_API_KEY) throw new Error("BAGS_API_KEY environment variable is required");
    _client = new BagsClient({ apiKey: process.env.BAGS_API_KEY });
  }
  return _client;
}

export function getWallet(): Keypair {
  if (!_wallet) {
    if (!process.env.SOLANA_PRIVATE_KEY) throw new Error("SOLANA_PRIVATE_KEY environment variable is required");
    _wallet = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY));
  }
  return _wallet;
}

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com");
  }
  return _connection;
}

export interface SwapResult {
  quote: Record<string, unknown>;
  executed: boolean;
  bundleId?: string;
  error?: unknown;
}

/**
 * Get a swap quote. Pass execute=true to sign and submit via Jito.
 */
export async function getQuote(
  inputMint: string,
  outputMint: string,
  amountLamports: string
): Promise<Record<string, unknown>> {
  const quote = await getClient().trade.getQuote({
    inputMint,
    outputMint,
    amount: amountLamports,
  });
  return quote;
}

/**
 * Execute a swap from a quote. Signs and submits via Jito bundle.
 */
export async function executeSwap(quote: Record<string, unknown>): Promise<SwapResult> {
  const wallet = getWallet();
  const connection = getConnection();
  const client = getClient();

  const { swapTransaction } = await client.trade.createSwapTransaction({
    quoteResponse: quote,
    userPublicKey: wallet.publicKey.toBase58(),
  });

  // Deserialize and sign (API returns base58-encoded transaction)
  const txBuffer = bs58.decode(swapTransaction as string);
  const tx = VersionedTransaction.deserialize(txBuffer);
  tx.sign([wallet]);

  // Simulate before submitting
  const simulation = await connection.simulateTransaction(tx);
  if (simulation.value.err) {
    console.error("Simulation failed:", simulation.value.err);
    return { quote, executed: false, error: simulation.value.err };
  }

  // Submit via Jito bundle (MEV-protected, base58-encoded)
  const serialized = bs58.encode(tx.serialize());

  const bundleId = await client.solana.sendBundle({
    transactions: [serialized],
    region: "mainnet",
  });

  console.log(`Bundle submitted: ${bundleId}`);
  return { quote, executed: true, bundleId };
}

/**
 * Check token feed for new launches.
 */
export async function getRecentLaunches(): Promise<Record<string, unknown>[]> {
  if (!process.env.BAGS_API_KEY) throw new Error("BAGS_API_KEY environment variable is required");
  const response = await fetch("https://public-api-v2.bags.fm/api/v1/token-launch/feed", {
    headers: { "x-api-key": process.env.BAGS_API_KEY },
  });
  if (!response.ok) {
    console.error(`Feed fetch failed (${response.status})`);
    return [];
  }
  const data = await response.json();
  return data.success ? data.response : [];
}
