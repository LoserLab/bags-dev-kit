# Bags API Reference

Complete endpoint reference for the Bags Public API v2.

**Base URL:** `https://public-api-v2.bags.fm/api/v1`
**Auth:** `x-api-key` header (get keys at https://dev.bags.fm, max 10 per account)
**Rate Limit:** 1,000 requests/hour per user and per IP
**Response format:** `{"success": true, "response": {...}}` or `{"success": false, "error": "..."}`
**Rate limit headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Agent Authentication (No API Key Required)

For AI agents authenticating via Moltbook.

### POST `/agent/auth/init`
Initialize agent auth flow. Returns verification challenge.

**Body:**
```json
{ "agentUsername": "my-agent" }
```

**Response:**
```json
{
  "publicIdentifier": "abc123",
  "secret": "xyz789",
  "verificationPostContent": "Verify: abc123"
}
```
Challenge expires in 15 minutes.

### POST `/agent/auth/login`
Complete auth after posting verification content to Moltbook.

**Body:**
```json
{
  "publicIdentifier": "abc123",
  "secret": "xyz789",
  "postId": "moltbook-post-id"
}
```

**Response:** JWT token (365-day validity). Use as `Authorization: Bearer <jwt>`.

---

## Agent Management (JWT Auth)

### POST `/agent/dev/keys/create`
Create an API key for the authenticated agent. Max 10 per user.

### POST `/agent/dev/keys`
List all active API keys.

### POST `/agent/wallet/export`
Export the private key for the agent's Solana wallet.

### POST `/agent/wallet/list`
List all Solana wallets associated with the agent.

---

## Token Launch

### POST `/token-launch/create-token-info`
Create token metadata. Uses `multipart/form-data`.

**Fields:**
| Field | Required | Constraints |
|---|---|---|
| `name` | Yes | Max 32 characters |
| `symbol` | Yes | Max 10 characters |
| `description` | Yes | Max 1,000 characters |
| `image` | One of image/imageUrl | File upload |
| `imageUrl` | One of image/imageUrl | URL to image |
| `metadataUrl` | No | Custom IPFS metadata |
| `telegram` | No | Telegram link |
| `twitter` | No | Twitter link |
| `website` | No | Website URL |

**Response:**
```json
{
  "tokenMint": "...",
  "tokenMetadata": "https://ipfs.io/...",
  "tokenLaunch": { ... }
}
```

### POST `/token-launch/create-launch-transaction`
Create the launch transaction.

**Body:**
```json
{
  "ipfs": "ipfs-metadata-url",
  "tokenMint": "mint-address",
  "wallet": "creator-wallet",
  "initialBuyLamports": "500000000",
  "configKey": "fee-share-config-key",
  "tipWallet": "optional-jito-tip-wallet",
  "tipLamports": "optional-tip-amount"
}
```

**Response:** Base58 serialized transaction for signing.

### GET `/token-launch/feed`
Get recent token launches.

**Response:** Array of token objects with fields:
- `name`, `symbol`, `tokenMint`, `description`, `image`
- `status`: `PRE_LAUNCH` | `PRE_GRAD` | `MIGRATING` | `MIGRATED`
- `dbcConfigKey`, `dbcPoolKey`, `dammV2PoolKey`

### GET `/token-launch/lifetime-fees?tokenMint=<mint>`
Total lifetime fees for a token in lamports (returned as string for bigint safety).

### GET `/token-launch/claimable-positions?wallet=<address>`
All claimable fee positions for a wallet across virtual pools, DAMM v2 pools, and custom vaults.

### POST `/token-launch/claim-txs/v3`
Generate claim transactions.

**Body:**
```json
{
  "feeClaimer": "wallet-address",
  "tokenMint": "mint-address"
}
```

**Response:** Array of `{ tx, blockhash }` objects. Execute all to claim.

### GET `/token-launch/creator/v3?tokenMint=<mint>`
Get token creators with their social provider details and profile info.

### GET `/token-launch/claim-stats?tokenMint=<mint>`
Claim statistics for all fee claimers of a token.

### GET `/token-launch/fee-share/wallet/v2?username=<name>&provider=<provider>`
Look up wallet address by social media username.
Providers: `twitter`, `tiktok`, `kick`, `github`.

### POST `/token-launch/fee-share/wallet/v2/bulk`
Bulk wallet lookup.

**Body:**
```json
{
  "items": [
    { "username": "alice", "provider": "twitter" },
    { "username": "bob", "provider": "github" }
  ]
}
```

### POST `/token-launch/state/pool-config`
Get pool config keys from fee claimer vault public keys.

**Body:**
```json
{ "feeClaimerVaults": ["vault-pubkey-1", "vault-pubkey-2"] }
```

### GET `/token-launch/top-tokens/lifetime-fees`
Leaderboard of tokens ranked by total lifetime fees earned.

---

## Fee Sharing

### POST `/fee-share/config`
Create a fee share configuration.

**Body:**
```json
{
  "payer": "wallet-address",
  "baseMint": "token-mint",
  "claimersArray": ["wallet1", "wallet2", "wallet3"],
  "basisPointsArray": [5000, 3000, 2000],
  "partner": "optional-partner-wallet",
  "partnerConfig": "optional-partner-config-key",
  "additionalLookupTables": ["optional-lut"],
  "tipWallet": "optional-jito-tip",
  "tipLamports": "optional-tip-amount"
}
```

**Rules:**
- `basisPointsArray` MUST total exactly 10,000 (100%)
- Max 100 claimers per config
- `claimersArray` and `basisPointsArray` must be same length

**Response:**
```json
{
  "needsCreation": true,
  "feeShareAuthority": "...",
  "meteoraConfigKey": "...",
  "transactions": ["base58-tx-1", "base58-tx-2"]
}
```

### POST `/fee-share/admin/transfer-tx`
Transfer fee share admin rights.

**Body:**
```json
{
  "baseMint": "token-mint",
  "currentAdmin": "current-admin-wallet",
  "newAdmin": "new-admin-wallet",
  "payer": "payer-wallet"
}
```

### POST `/fee-share/admin/update-config`
Update fee share configuration (change claimers/splits).

**Body:**
```json
{
  "baseMint": "token-mint",
  "claimersArray": ["new-wallet1", "new-wallet2"],
  "basisPointsArray": [6000, 4000],
  "payer": "admin-wallet",
  "additionalLookupTables": ["optional"]
}
```

### GET `/fee-share/admin/list?wallet=<address>`
List all token mints where the given wallet is the fee share admin.

### GET `/fee-share/token/claim-events?tokenMint=<mint>`
Get fee claim events. Two pagination modes:

**Offset mode (default):**
- `limit` (default 50, max 100)
- `offset` (default 0)

**Time mode:**
- `mode=time`
- `from` (unix timestamp)
- `to` (unix timestamp)

---

## Partner System

Partners earn fees from tokens launched through their platform.

### POST `/fee-share/partner-config/creation-tx`
Create a partner config (one per wallet, permanent).

**Body:**
```json
{ "partnerWallet": "wallet-address" }
```

### POST `/fee-share/partner-config/claim-tx`
Generate transactions to claim partner fees.

**Body:**
```json
{ "partnerWallet": "wallet-address" }
```

**Response:** Array of transactions. The LAST transaction must execute LAST.

### GET `/fee-share/partner-config/stats?partner=<wallet>`
Get partner fee stats.

**Response:**
```json
{
  "claimedFees": "lamports-string",
  "unclaimedFees": "lamports-string"
}
```

---

## Trading

### GET `/trade/quote`
Get a swap quote.

**Query params:**
| Param | Required | Description |
|---|---|---|
| `inputMint` | Yes | Input token mint |
| `outputMint` | Yes | Output token mint |
| `amount` | Yes | Amount in smallest units (lamports) |
| `slippageMode` | No | `auto` or `manual` (default: auto) |
| `slippageBps` | No | 0-10000 (for manual mode) |

**Response:**
```json
{
  "requestId": "...",
  "inAmount": "1500000000",
  "outAmount": "42000000",
  "minOutAmount": "41580000",
  "priceImpactPct": "0.05",
  "slippageBps": 100,
  "routePlan": [...],
  "platformFee": { ... }
}
```

### POST `/trade/swap`
Create a swap transaction from a quote.

**Body:**
```json
{
  "quoteResponse": { ... },
  "userPublicKey": "wallet-address"
}
```

**Response:**
```json
{
  "swapTransaction": "base58-serialized-tx",
  "computeUnitLimit": 200000,
  "lastValidBlockHeight": 12345678,
  "prioritizationFeeLamports": 5000
}
```

---

## Solana Infrastructure

### GET `/solana/bags/pools`
Get all Bags pools. Optional: `onlyMigrated=true`.

**Response:** Array of `{ tokenMint, dbcConfigKey, dbcPoolKey, dammV2PoolKey }`.

### GET `/solana/bags/pools/token-mint?tokenMint=<mint>`
Get pool info for a specific token.

### POST `/solana/send-transaction`
Submit a signed transaction.

**Body:**
```json
{ "transaction": "base58-signed-tx" }
```

**Response:** Transaction signature string.

### POST `/solana/send-bundle`
Submit a Jito bundle for MEV protection.

**Body:**
```json
{
  "transactions": ["base58-tx-1", "base58-tx-2"],
  "region": "mainnet"
}
```

**Response:** Bundle ID string.

### POST `/solana/get-bundle-statuses`
Check Jito bundle status.

**Body:**
```json
{
  "bundleIds": ["bundle-id-1"],
  "region": "mainnet"
}
```

### GET `/solana/jito-recent-fees`
Get recent Jito tip fee percentiles (for estimating competitive tips).

---

## Dexscreener Integration

### GET `/solana/dexscreener/order-availability?tokenAddress=<mint>`
Check if a Dexscreener token info order is available for this token.

### POST `/solana/dexscreener/create-order`
Create a Dexscreener token info order. Returns a payment transaction to sign.

### POST `/solana/dexscreener/submit-payment`
Submit the signed Dexscreener payment.

**Body:**
```json
{
  "orderUUID": "order-uuid",
  "paymentSignature": "tx-signature"
}
```

---

## SDK Reference

**Package:** `@bagsfm/bags-sdk` (v1.3.1)
**Install:** `npm install @bagsfm/bags-sdk`
**Requires:** Node.js >= 18, `@solana/web3.js`, `@coral-xyz/anchor`

```typescript
import { BagsClient } from "@bagsfm/bags-sdk";

const bags = new BagsClient({ apiKey: "your-key" });

// Token launch
const tokenInfo = await bags.tokenLaunch.createTokenInfoAndMetadata({ ... });
const launchTx = await bags.tokenLaunch.createLaunchTransaction({ ... });

// Trading
const quote = await bags.trade.getQuote({ inputMint, outputMint, amount });
const swap = await bags.trade.createSwapTransaction({ quoteResponse, userPublicKey });

// Fees
const positions = await bags.fee.getAllClaimablePositions(wallet);
const claimTxs = await bags.fee.getClaimTransaction({ feeClaimer, tokenMint });

// Fee config
const config = await bags.config.createBagsFeeShareConfig({ ... });

// Partner
const partnerConfig = await bags.partner.getPartnerConfigCreationTransaction(wallet);
const stats = await bags.partner.getPartnerConfigClaimStats(wallet);

// State queries
const lifetimeFees = await bags.state.getTokenLifetimeFees(tokenMint);
const creators = await bags.state.getTokenCreators(tokenMint);
const topTokens = await bags.state.getTopTokensByLifetimeFees();
const claimStats = await bags.state.getTokenClaimStats(tokenMint);
const events = await bags.state.getTokenClaimEvents(tokenMint);

// Solana
await bags.solana.sendBundle({ transactions, region });
```

**Exported Utilities:**
- `signAndSendTransaction()` - Sign and submit a transaction
- `sendBundleAndConfirm()` - Send Jito bundle and wait for confirmation
- `createTipTransaction()` - Create a Jito tip transaction
- `serializeVersionedTransaction()` - Serialize a versioned transaction
- `waitForSlotsToPass()` - Wait for Solana slots

**Key Constants:**
- `BAGS_PUBLIC_API_V2_DEFAULT_BASE_URL` - API base URL
- `BAGS_TOKEN_CREATION_AUTHORITY` - Token creation authority pubkey
- `WRAPPED_SOL_MINT` - Wrapped SOL mint address
- `JITO_TIP_ACCOUNTS` - Array of 8 Jito tip account pubkeys
- `BAGS_GLOBAL_LUT` - Bags global lookup table address
- Program IDs for Fee Share V1, Fee Share V2, Meteora DBC, DAMM V2
