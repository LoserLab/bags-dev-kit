---
description: Scaffold a new Bags app from a template. Choose from fee-sharing app, trading bot, or token launcher.
---

# Scaffold

Create a new Bags app project from a template.

## Instructions

1. Ask the user which type of app they want to build:

| Template | Description |
|---|---|
| `fee-sharing-app` | App that earns from token trades (Next.js + Bags SDK + Privy) |
| `trading-bot` | Automated trading with Jito MEV protection (Node.js + Bags SDK) |
| `token-launcher` | Platform for launching tokens with fee configs (Next.js + Bags SDK + Privy) |

2. Ask for a project name (used for directory name and package.json).

3. Read the reference file for architecture context:
```
~/.claude/skills/bags-dev-kit/references/architecture-patterns.md
```

4. Copy the matching template from:
```
~/.claude/skills/bags-dev-kit/templates/<template-name>/
```

5. Customize the template:
   - Update `package.json` with the project name
   - Create `.env.example` with required environment variables
   - If the user provided an API key during setup, add it to `.env.local`
   - Update README.md with project-specific details

6. Install dependencies:
```bash
cd <project-dir> && npm install
```

7. Show the user:
   - Project structure overview
   - What to configure in `.env.local`
   - How to run the dev server
   - Key files to start editing
   - Suggest reading `references/security.md` before deploying
