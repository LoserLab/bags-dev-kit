---
description: Analyze a Bags token's performance, fees, creators, and pool status. Provides actionable insights.
---

# Analyze

Deep analysis of a Bags token.

## Instructions

1. Get the token mint from `$ARGUMENTS`. If not provided, ask the user.

2. Run the analysis script:
```bash
npx tsx ~/.claude/skills/bags-dev-kit/scripts/analyze.ts <token-mint>
```

3. Read the fee economics reference for context:
```
~/.claude/skills/bags-dev-kit/references/fee-economics.md
```

4. Present the analysis in sections:

### Token Overview
- Creators (names, social handles, profiles)
- Pool status (DBC vs DAMM v2, migration status)

### Fee Performance
- Lifetime fees (total SOL generated)
- Claim rate (% of fees claimed vs. unclaimed)
- Per-claimer breakdown (who's earning what)

### Insights
Based on the data, provide actionable observations:
- Is the claim rate healthy? (>80% = good, <50% = fees being left unclaimed)
- Is the token migrated to DAMM v2? (better liquidity)
- Are fee splits balanced or skewed?
- Estimated daily/weekly fees if volume data is available

### Recommendations
- If unclaimed fees: suggest claiming
- If pre-graduation: note what graduation means for liquidity
- If fee splits look suboptimal: suggest adjustments (reference fee economics)
- If no partner config: suggest setting one up
