---
description: Explore Bags tokens, pools, fees, and social wallets. Query live data from the Bags API.
---

# Explore

Query live data from the Bags ecosystem. This command routes to the appropriate script based on what the user wants to see.

## Instructions

Parse the user's intent from `$ARGUMENTS` and route to the right script. If no arguments, show a menu of options.

### Token Feed (recent launches)
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/token-info.ts --feed
```

### Top Tokens (by lifetime fees)
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/token-info.ts --top
```

### Token Details (specific token)
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/token-info.ts --mint <token-mint>
```

### Token Analysis (comprehensive)
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/analyze.ts <token-mint>
```

### Pool Lookup
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/pools.ts --token <mint>
```

### All Pools
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/pools.ts [--migrated]
```

### Fee Check (wallet)
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/fees.ts <wallet-address>
```

### Swap Quote
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/quote.ts <input-mint> <output-mint> <amount>
```
Shorthand: `SOL` resolves to wrapped SOL mint automatically.

### Social Wallet Lookup
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/social-lookup.ts <provider> <username>
```
Providers: twitter, tiktok, kick, github.

## Presentation

Format the JSON output into readable tables or summaries. For token feeds, show name, symbol, status, and mint. For fees, show SOL amounts and position count. For quotes, show input/output amounts and price impact.
