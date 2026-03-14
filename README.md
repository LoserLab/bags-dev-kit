# Bags Dev Kit

The developer toolkit for building on [Bags.fm](https://bags.fm). A Claude Code skill that gives you everything you need to ship Bags apps fast: live API exploration, project scaffolding, token launches, fee optimization, and deep reference docs.

Not an API wrapper. A build system.

## Install

```bash
claude skill add LoserLab/bags-dev-kit
```

Or clone and link locally:

```bash
git clone https://github.com/LoserLab/bags-dev-kit.git ~/.claude/skills/bags-dev-kit
```

## Setup

```
/bags-dev-kit:setup
```

You'll need a Bags API key (free at [dev.bags.fm](https://dev.bags.fm)).

## Commands

| Command | What it does |
|---|---|
| `/bags-dev-kit:setup` | Configure API key and default wallet |
| `/bags-dev-kit:explore` | Query live tokens, pools, fees, quotes, social wallets |
| `/bags-dev-kit:scaffold` | Scaffold a new Bags app from a template |
| `/bags-dev-kit:launch` | Interactive token launch wizard with fee sharing |
| `/bags-dev-kit:analyze` | Deep analysis of any Bags token's performance |

## What's Inside

### Scripts (zero dependencies, native fetch)
Executable tools for exploring the Bags ecosystem directly from Claude Code:
- **quote** - Get swap quotes (`SOL` shorthand supported)
- **fees** - Check claimable fee positions for any wallet
- **pools** - List and search Bags pools
- **social-lookup** - Find wallets by Twitter/TikTok/Kick/GitHub handle
- **token-info** - Browse the launch feed, top tokens, token details
- **analyze** - Comprehensive token analysis (fees, creators, pools, claim rates)

### Reference Docs (loaded on-demand)
Deep knowledge that Claude loads only when needed:
- **bags-api.md** - Complete API endpoint reference with examples
- **fee-economics.md** - Fee share strategy guide, common structures, revenue modeling
- **security.md** - Transaction safety, key management, production checklist
- **architecture-patterns.md** - 5 app architectures with stack recommendations

### Project Templates
Scaffold complete starter projects:
- **fee-sharing-app** - Next.js + Bags SDK + Privy. Earn from token trades.
- **trading-bot** - Node.js + Bags SDK + Jito. Automated trading with MEV protection.
- **token-launcher** - Next.js + Bags SDK + Privy. Full launch platform.

## How It Works

This skill teaches Claude Code how to build on Bags. When you mention anything Bags-related, the skill activates and gives Claude:

1. **Live tools** to query the Bags API (scripts)
2. **Deep context** about the Bags ecosystem (references)
3. **Working starter code** for common app types (templates)
4. **Step-by-step workflows** for complex operations (commands)

It's like having a Bags expert pair programmer.

## Examples

```
"scaffold a trading bot that buys new token launches"
"check my claimable fees"
"get a quote for swapping 2 SOL into this token: <mint>"
"analyze this token's fee performance: <mint>"
"launch a token with 70/30 fee split between me and my partner"
"find the wallet for @username on twitter"
"help me build a fee-sharing app on Bags"
```

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- Node.js >= 18 (for script execution via `npx tsx`)
- Bags API key ([dev.bags.fm](https://dev.bags.fm))

## Author

Created by [**Heathen**](https://x.com/heathenft)

Built in [Mirra](https://mirra.app)

## License

MIT
