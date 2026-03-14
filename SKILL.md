---
name: bags-dev-kit
description: >
  Full-stack developer toolkit for building on Bags.fm (Solana). Scaffold Bags apps,
  explore tokens and pools, get swap quotes, analyze fee earnings, optimize fee-share
  configs, launch tokens, and ship Bags integrations fast. Use whenever the user is
  building on Bags, working with the Bags API or SDK, launching tokens, configuring
  fee shares, querying Bags pools, or developing Solana apps that integrate with
  Bags.fm. Trigger phrases: "bags", "bags.fm", "bags api", "bags sdk", "bags token",
  "fee sharing", "launch token", "bags scaffold", "bags dev kit", "build on bags",
  "bags hackathon", "bags app", "bags fees", "swap on bags", "bags pool".
invoke: user
metadata:
  author: Heathen
  version: 1.0.0
  tags: [bags, solana, defi, token-launch, fee-sharing, trading, web3, bags-api]
---

# Bags Dev Kit

The developer toolkit for building on Bags.fm. Not an API wrapper. A build system.

Bags.fm is a creator-focused token launch and trading platform on Solana. Creators earn 1% from every trade via programmable fee sharing. Tokens launch on Meteora Dynamic Bonding Curves and migrate to Meteora DAMM v2 pools after graduation.

---

## Config

All config lives at `~/.bags-dev-kit/config.json`. Created by `/bags-dev-kit:setup`.

```json
{
  "apiKey": "your-bags-api-key",
  "defaultWallet": "optional-solana-pubkey"
}
```

API keys are free. Get one at https://dev.bags.fm (max 10 per account).

---

## Routing Logic (Run Every Invocation)

1. **Check config.** Read `~/.bags-dev-kit/config.json`. If missing, tell the user to run `/bags-dev-kit:setup` first.
2. **Match intent to command.** Use the table below.
3. **Load references on-demand.** Only read reference files when the task requires deep knowledge. Never load all references at once.

| User Intent | Command | Reference to Load |
|---|---|---|
| Set up API key | `/bags-dev-kit:setup` | None |
| Scaffold a new Bags project | `/bags-dev-kit:scaffold` | `references/architecture-patterns.md` |
| Explore tokens, pools, feeds | `/bags-dev-kit:explore` | None (scripts handle it) |
| Launch a token | `/bags-dev-kit:launch` | `references/fee-economics.md`, `references/security.md` |
| Analyze token performance / fees | `/bags-dev-kit:analyze` | `references/fee-economics.md` |
| Write code using Bags API/SDK | Read `references/bags-api.md` | `references/bags-api.md` |
| Security review of Bags code | Read `references/security.md` | `references/security.md` |
| Optimize fee share config | Read `references/fee-economics.md` | `references/fee-economics.md` |

---

## Scripts

All scripts live at the skill root under `scripts/` and run via `npx tsx`. They use native `fetch` with zero external dependencies.

Every script reads the API key from `~/.bags-dev-kit/config.json` automatically. If the config is missing, scripts exit with a clear error.

| Script | Purpose | Example |
|---|---|---|
| `quote.ts` | Get swap quotes | `npx tsx <skill>/scripts/quote.ts SOL <token-mint> 1.5` |
| `fees.ts` | Check claimable fees | `npx tsx <skill>/scripts/fees.ts <wallet-address>` |
| `pools.ts` | List/search pools | `npx tsx <skill>/scripts/pools.ts [--token <mint>] [--migrated]` |
| `social-lookup.ts` | Find wallet by social handle | `npx tsx <skill>/scripts/social-lookup.ts twitter <username>` |
| `token-info.ts` | Get token feed / details | `npx tsx <skill>/scripts/token-info.ts [--mint <mint>] [--feed]` |
| `analyze.ts` | Analyze token fees + performance | `npx tsx <skill>/scripts/analyze.ts <token-mint>` |

Replace `<skill>` with the actual skill directory path: `~/.claude/skills/bags-dev-kit`.

---

## Rules

1. **Never handle private keys in scripts.** Read-only operations run directly. Write operations (launch, swap, claim) generate code for the user to integrate into their project.
2. **Always confirm before generating write transactions.** Show the user exactly what will happen (amounts, recipients, fee splits) and get explicit approval.
3. **Load references progressively.** Only read reference files when the current task needs that knowledge. The SKILL.md body is always available; references are supplementary.
4. **Use the Bags SDK (`@bagsfm/bags-sdk`) when generating project code.** Use raw fetch in skill scripts to avoid dependency overhead.
5. **Default to Jito-protected transactions** when generating swap or launch code. Never generate code that submits transactions without MEV protection unless the user explicitly opts out.
6. **Fee share splits must total 10,000 basis points (100%).** Validate this before generating any fee config code.
7. **Present, don't assume.** Always show quotes, fee breakdowns, and transaction details to the user before proceeding.

---

## Key Constants

```
API Base URL:     https://public-api-v2.bags.fm/api/v1
Auth Header:      x-api-key: <key>
Rate Limit:       1,000 requests/hour
WSOL Mint:        So11111111111111111111111111111111111111112
Bags Global LUT:  BaGSdevkitConstant (see references/bags-api.md for full list)
```

---

## Ecosystem Context

When helping users build on Bags, keep these in mind:

- **Tokens have 4 lifecycle stages**: PRE_LAUNCH → PRE_GRAD (on bonding curve) → MIGRATING → MIGRATED (on DAMM v2)
- **Fee sharing is the core primitive.** Up to 100 co-earners per token, splits defined in basis points. This is what makes Bags different from Pump.fun.
- **The Partner system** lets platforms earn fees from tokens launched through them. Great for building launch platforms, aggregators, or tools.
- **Agent auth** is first-class. AI agents can authenticate via Moltbook, get JWTs (365-day validity), and operate wallets. Bags treats agents as equal citizens.
- **Bags Play CLI** (`curl -fsSL https://play.bags.fm/install.sh | bash`) is the official tool for programmable fee automation.

---

## Template Projects

When scaffolding, copy from `templates/` in the skill directory and customize. Three starter architectures are included:

| Template | Use Case | Stack |
|---|---|---|
| `fee-sharing-app` | App that earns from token trades | Next.js + Bags SDK + Privy |
| `trading-bot` | Automated trading with Jito MEV protection | Node.js + Bags SDK + Helius |
| `token-launcher` | Platform for launching tokens with fee configs | Next.js + Bags SDK + Privy + Meteora |

Each template includes a working `bags-client.ts` with typed API methods, environment variable setup, and README with deployment instructions.
