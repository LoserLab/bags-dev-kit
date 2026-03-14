---
description: Configure the Bags Dev Kit with your API key and optional default wallet
---

# Setup

Configure the Bags Dev Kit for use in all projects.

## Instructions

1. Ask the user for their Bags API key. If they don't have one, direct them to https://dev.bags.fm to create one (free, max 10 per account).

2. Optionally ask for a default Solana wallet address (used as fallback for fee checks and other wallet-based queries).

3. Run the setup script:

```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/setup.ts "<api-key>" "<optional-wallet>"
```

4. Confirm success and show the config path (`~/.bags-dev-kit/config.json`).

5. Suggest next steps:
   - `/bags-dev-kit:explore` to browse live tokens and pools
   - `/bags-dev-kit:scaffold` to start a new project
   - Ask about the Bags API to get coding help
