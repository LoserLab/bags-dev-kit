---
description: Interactive token launch wizard. Walks through metadata, fee sharing configuration, and transaction creation step by step.
---

# Launch

Interactive wizard for launching a token on Bags.fm.

## Instructions

**IMPORTANT:** This command generates code and transactions. It does NOT execute transactions automatically. The user must review and sign everything.

### Step 1: Load Context

Read the following reference files:
- `~/.claude/skills/bags-dev-kit/references/fee-economics.md`
- `~/.claude/skills/bags-dev-kit/references/security.md`

### Step 2: Gather Token Info

Ask the user for:
- **Name** (max 32 characters)
- **Symbol** (max 10 characters)
- **Description** (max 1,000 characters)
- **Image** (file path or URL)
- **Social links** (Twitter, Telegram, Website - all optional)

### Step 3: Configure Fee Sharing

Ask who should earn from trading fees. Present common structures from the fee economics reference:
- Solo creator (100%)
- Creator + collaborators (custom split)
- Creator + platform (70/30, 80/20, etc.)

For each claimer, collect:
- Wallet address OR social handle (use social-lookup script to resolve)
- Basis points allocation

**Validate:** splits must total exactly 10,000 bps.

### Step 4: Initial Buy

Ask if the creator wants to make an initial buy at launch:
- Recommended: 0.1-1 SOL for liquidity signaling
- Optional: can be 0

### Step 5: Review

Present a complete summary:
- Token details (name, symbol, description)
- Fee share config (all claimers with percentages)
- Initial buy amount
- Estimated gas cost

**Get explicit confirmation before proceeding.**

### Step 6: Generate Code

Generate a TypeScript file that:
1. Creates the fee share config
2. Creates token metadata via the API
3. Creates the launch transaction
4. Signs and submits via Jito bundle

Use the `@bagsfm/bags-sdk` for all operations. Include proper error handling and the security patterns from the reference.

The generated file should be self-contained and runnable with `npx tsx launch-<symbol>.ts`.

### Step 7: Next Steps

After generating the code:
- Tell the user to review the generated file
- Remind them to fund their wallet with SOL for gas + initial buy
- Suggest setting up Dexscreener token info after launch
- Recommend monitoring fees via `/bags-dev-kit:explore`
