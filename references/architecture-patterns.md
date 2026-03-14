# Architecture Patterns for Bags Apps

Common architectures for building on Bags.fm, from simple to complex.

---

## Pattern 1: Fee-Sharing App

An app where users launch tokens and the platform earns from every trade.

**How it works:**
1. User connects wallet (Privy, Phantom, or similar)
2. User fills out token details (name, symbol, image, description)
3. App creates fee share config with platform as a claimer
4. App creates and submits launch transaction
5. Platform earns fees from all trading activity

**Architecture:**
```
Frontend (Next.js)
  ├── Token creation form
  ├── Wallet connection (Privy)
  ├── Transaction signing
  └── Dashboard (fees earned, tokens launched)

Backend (API routes)
  ├── POST /api/launch - Create token + fee config + launch tx
  ├── GET /api/fees - Check claimable fees
  ├── POST /api/claim - Generate claim transactions
  └── Bags SDK client (server-side)
```

**Key decisions:**
- Fee split: typically 70/30 (creator/platform) to 90/10
- Partner config: register as a Bags partner for additional revenue
- Token metadata: store on IPFS via Bags API (handled automatically)

**Stack:** Next.js + `@bagsfm/bags-sdk` + Privy + Vercel

---

## Pattern 2: Trading Bot

Automated trading on Bags pools with MEV protection.

**How it works:**
1. Bot monitors token feed for new launches or price conditions
2. Gets swap quotes from Bags API
3. Signs and submits via Jito bundles
4. Tracks P&L and manages positions

**Architecture:**
```
Node.js Process
  ├── Market monitor (poll token feed + pools)
  ├── Strategy engine (entry/exit signals)
  ├── Execution engine
  │   ├── Quote fetcher
  │   ├── Transaction builder
  │   ├── Jito bundle submitter
  │   └── Confirmation tracker
  ├── Portfolio tracker
  └── Logging / alerts
```

**Key decisions:**
- Polling interval: 5-10s for new launches, 30-60s for price checks
- Slippage: auto for small trades, manual (50-200 bps) for larger ones
- Position sizing: fixed amount or percentage-based
- Jito tips: use `jito-recent-fees` endpoint to estimate competitive tips

**Stack:** Node.js + `@bagsfm/bags-sdk` + `@solana/web3.js` + Helius RPC

---

## Pattern 3: Token Launch Platform

A full platform for launching tokens with advanced fee configurations.

**How it works:**
1. Creators sign up and connect socials (Twitter, TikTok, etc.)
2. Creator configures token details and fee share splits
3. Platform validates config, creates on-chain fee share
4. Token launches on Meteora DBC
5. Dashboard tracks performance, fees, and graduation status

**Architecture:**
```
Frontend (Next.js)
  ├── Creator onboarding flow
  ├── Token configuration wizard
  │   ├── Basic info (name, symbol, image)
  │   ├── Fee share setup (drag-and-drop split editor)
  │   ├── Social links
  │   └── Initial buy amount
  ├── Launch confirmation + signing
  ├── Dashboard
  │   ├── Token performance (status, volume, fees)
  │   ├── Fee claiming interface
  │   └── Admin panel (update splits, transfer admin)
  └── Public token pages

Backend (API routes / serverless)
  ├── POST /api/configure - Validate + create fee share config
  ├── POST /api/launch - Create launch transaction
  ├── GET /api/tokens - List user's tokens
  ├── GET /api/analytics - Token performance data
  ├── POST /api/claim - Generate claim transactions
  └── POST /api/admin/update - Update fee share config

Database (optional)
  ├── Users (wallet, socials, created tokens)
  ├── Tokens (mint, config, status, metadata)
  └── Claims (history, amounts, timestamps)
```

**Key decisions:**
- Social wallet resolution: use Bags API to map social handles to wallets for fee claimers
- Graduation tracking: poll pool status to detect DBC -> DAMM v2 migration
- Dexscreener integration: auto-create token info orders for launched tokens
- Partner revenue: register platform as partner for compounding fees

**Stack:** Next.js + `@bagsfm/bags-sdk` + Privy + Supabase/Postgres + Vercel

---

## Pattern 4: Analytics Dashboard

A read-only tool that surfaces insights from Bags data.

**How it works:**
1. User enters wallet address or token mint
2. App fetches and aggregates data from multiple Bags endpoints
3. Displays charts, leaderboards, and insights

**Architecture:**
```
Frontend (Next.js / static)
  ├── Wallet analyzer (fees earned, positions, history)
  ├── Token analyzer (volume, fees, creators, claim rates)
  ├── Leaderboards (top tokens by fees, top creators)
  └── Feed (recent launches with status indicators)

Backend (API routes, can be cached aggressively)
  ├── GET /api/wallet/:address - Aggregate wallet data
  ├── GET /api/token/:mint - Aggregate token data
  ├── GET /api/leaderboard - Top tokens/creators
  └── GET /api/feed - Recent launches

Cache layer
  ├── Pool data (5-minute TTL)
  ├── Leaderboard (1-minute TTL)
  └── Token metadata (1-hour TTL)
```

**Stack:** Next.js + Bags API (raw fetch) + Redis/KV cache + Vercel

---

## Pattern 5: AI Agent

An autonomous agent that operates on Bags via the agent auth system.

**How it works:**
1. Agent authenticates via Moltbook (one-time setup)
2. Agent receives JWT (365-day validity) and wallet
3. Agent autonomously launches tokens, trades, or manages fees
4. Agent can create its own API keys for sub-operations

**Architecture:**
```
Agent Process
  ├── Auth manager (JWT storage, renewal)
  ├── Wallet manager (balance tracking, funding)
  ├── Strategy module (what to do and when)
  ├── Execution module
  │   ├── Token launcher
  │   ├── Trader
  │   ├── Fee claimer
  │   └── Config manager
  ├── Social module (Moltbook posting)
  └── Monitoring / reporting
```

**Key decisions:**
- Funding: agent wallet needs SOL for gas and initial buys
- Autonomy level: fully autonomous vs. human-in-the-loop for large operations
- Risk controls: max position sizes, daily loss limits, slippage caps
- Reporting: log all operations, alert on anomalies

**Stack:** Node.js + `@bagsfm/bags-sdk` + `@solana/web3.js` + cron/PM2

---

## Shared Best Practices

### Error Handling
```typescript
try {
  const data = await bags.trade.getQuote({ ... });
} catch (error) {
  if (error.status === 429) {
    // Rate limited - exponential backoff
    await sleep(Math.pow(2, retryCount) * 1000);
  } else if (error.status === 400) {
    // Bad request - check inputs
  } else {
    // Network/server error - retry with backoff
  }
}
```

### Environment Variables
```env
BAGS_API_KEY=your-api-key
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=xxx
SOLANA_PRIVATE_KEY=base58-private-key
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-id
```

### Project Structure
```
my-bags-app/
  ├── src/
  │   ├── lib/
  │   │   ├── bags-client.ts    # Bags SDK wrapper with error handling
  │   │   ├── solana.ts         # Connection, signing utilities
  │   │   └── constants.ts      # Mints, program IDs, config
  │   ├── app/                  # Next.js app router
  │   └── components/           # UI components
  ├── .env.local                # Environment variables (gitignored)
  ├── package.json
  └── tsconfig.json
```
