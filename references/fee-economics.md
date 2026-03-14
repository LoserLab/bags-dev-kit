# Fee Economics: Strategy Guide

How fee sharing works on Bags.fm and how to design optimal configurations.

---

## How Bags Fee Sharing Works

Every token on Bags has a 1% trading fee built into the protocol. This fee is split among up to 100 "claimers" based on a configurable basis points allocation.

**Key mechanics:**
- Fees accrue in SOL (from both buy and sell trades)
- Fees are NOT automatically distributed. Claimers must submit claim transactions
- Fee configs are mutable by the admin. The admin can change claimers and splits at any time
- Fee configs are set BEFORE launch. The `configKey` from fee config creation is passed to the launch transaction

**Lifecycle:**
1. Create fee share config (defines who gets what)
2. Launch token with that config
3. Trading generates fees (1% per trade)
4. Fees accrue in pools (DBC pre-graduation, DAMM v2 post-graduation)
5. Claimers submit claim transactions to collect

---

## Basis Points System

Splits are defined in basis points (bps). 10,000 bps = 100%.

| Split | Basis Points | Percentage |
|---|---|---|
| Solo creator | 10000 | 100% |
| 50/50 split | 5000, 5000 | 50%, 50% |
| Creator + 2 contributors | 6000, 2000, 2000 | 60%, 20%, 20% |
| Creator + platform partner | 7000, 3000 | 70%, 30% |

**Rules:**
- Array MUST total exactly 10,000
- Minimum 1 claimer, maximum 100
- `claimersArray` and `basisPointsArray` must be same length
- Each claimer is a Solana wallet address

---

## Common Fee Structures

### Solo Creator
```json
{
  "claimersArray": ["creator-wallet"],
  "basisPointsArray": [10000]
}
```
Best for: personal tokens, meme coins, simple launches.

### Creator + Collaborators
```json
{
  "claimersArray": ["creator", "collaborator1", "collaborator2"],
  "basisPointsArray": [5000, 3000, 2000]
}
```
Best for: team projects, collaborative content, partnerships.

### Platform Fee Model
```json
{
  "claimersArray": ["creator", "platform-treasury"],
  "basisPointsArray": [7000, 3000]
}
```
Best for: launch platforms, aggregators, tools that facilitate token creation.

### Community Distribution
```json
{
  "claimersArray": ["treasury", "dev1", "dev2", "community-wallet", "marketing"],
  "basisPointsArray": [3000, 2000, 2000, 2000, 1000]
}
```
Best for: DAO-style tokens, community projects.

### Influencer Network
```json
{
  "claimersArray": ["creator", "promoter1", "promoter2", "promoter3"],
  "basisPointsArray": [4000, 2000, 2000, 2000]
}
```
Best for: tokens promoted across multiple social channels.

---

## Partner System

Partners are platforms that facilitate token launches. They earn fees from ALL tokens launched through their platform, separate from the per-token fee share.

**How it works:**
1. Create a partner config (one per wallet, permanent)
2. When creating fee share configs, include `partner` and `partnerConfig` fields
3. Partner fees accrue automatically from all associated token trades
4. Claim partner fees separately via the partner claim endpoint

**Building a partner platform:**
- Register as a partner (create partner config transaction)
- When users launch tokens through your app, include your partner wallet in the fee config
- Track earnings via partner stats endpoint
- Claim accumulated fees periodically

This is the most scalable revenue model on Bags: you earn from every token launched through your platform, forever, without being in the per-token fee share.

---

## Fee Claiming Strategy

Fees must be manually claimed. Consider these strategies:

### Batch Claiming
Claim transactions can return multiple transactions. Execute them all in sequence. For tokens with activity across both DBC and DAMM v2 pools, you may receive separate claim transactions for each.

### Claim Timing
- Small positions: claim weekly or monthly (gas costs vs. fee amounts)
- Large positions: claim daily or on-demand
- Multiple tokens: batch claims across tokens in a single session

### Monitoring
- Use `claimable-positions` endpoint to check all positions for a wallet
- Use `claim-stats` to see the full picture for a specific token
- Use `lifetime-fees` to track total fee generation over time

---

## Revenue Modeling

For a token generating $X daily volume:
- 1% fee = $X * 0.01 daily fee pool
- Your share = fee pool * (your bps / 10000)

Example: Token does $100K daily volume, you have 5000 bps (50%):
- Daily fees: $100K * 0.01 = $1,000
- Your share: $1,000 * 0.50 = $500/day

Volume is the key driver. Fee optimization matters less than volume generation. When building fee-sharing apps, focus on features that drive trading volume.

---

## Anti-Patterns to Avoid

1. **Too many claimers with tiny splits.** Gas costs for claiming can exceed earnings for small positions. Keep meaningful splits (>500 bps / 5%) for active claimers.

2. **Forgetting to claim.** Fees don't auto-distribute. Build claim reminders or automated claiming into your app.

3. **Ignoring the admin key.** The fee share admin can change configs. If you're building a trustless system, consider transferring admin to a multisig or program-owned account.

4. **Not using the partner system.** If you're building a platform, partner fees compound across all tokens. It's free money you're leaving on the table.

5. **Static configs for dynamic teams.** Use the admin update endpoint to adjust splits as team composition changes. Don't lock in splits that don't reflect current contributions.
