# Security Checklist for Bags Apps

Security considerations when building on Bags.fm and Solana.

---

## Transaction Safety

### Always Use Jito MEV Protection
All swap and launch transactions should be submitted via Jito bundles, not raw `sendTransaction`. This prevents sandwich attacks and front-running.

```typescript
// GOOD: Submit via Jito bundle
const bundleId = await bags.solana.sendBundle({
  transactions: [signedTx],
  region: "mainnet",
});

// BAD: Raw submission (vulnerable to MEV)
const sig = await connection.sendTransaction(signedTx);
```

### Validate Transaction Contents Before Signing
Never blindly sign transactions returned by any API. Deserialize and inspect:
- Destination addresses match expected values
- Amounts are within expected ranges
- No unexpected instructions (e.g., token approvals to unknown wallets)

```typescript
import { VersionedTransaction } from "@solana/web3.js";

const tx = VersionedTransaction.deserialize(Buffer.from(serializedTx, "base64"));
// Inspect tx.message.compiledInstructions before signing
```

### Confirm Slippage Settings
For swaps, always verify slippage before executing:
- Auto slippage is generally safe for normal-sized trades
- For large trades (>$10K), use manual slippage with tight bounds
- Never set slippage above 1000 bps (10%) unless the user explicitly requests it

---

## Key Management

### Never Store Private Keys in Code
Use environment variables, secure vaults, or wallet adapters.

```typescript
// GOOD
const privateKey = process.env.SOLANA_PRIVATE_KEY;

// BAD
const privateKey = "5abc123...";
```

### Agent Wallet Security
If using agent auth:
- Store JWTs securely (they're valid for 365 days)
- Agent wallets hold real SOL. Treat wallet export endpoints with extreme caution
- Rotate API keys if any are compromised (they can be revoked but not un-revoked)

### Fee Share Admin Key
The fee share admin can change claimers and splits at any time. This is a powerful permission:
- For trustless systems, transfer admin to a multisig or PDA
- For platform-managed tokens, keep admin in a secure backend
- Never expose admin operations in client-side code

---

## API Security

### Protect Your API Key
- Never commit API keys to git
- Use `.env` files locally, secret managers in production
- Rate limit is 1,000 req/hour. If you're building a multi-user app, consider key rotation or a backend proxy

### Input Validation
- Token mints: validate as valid base58 Solana pubkeys (32 bytes)
- Amounts: validate as positive integers, check for overflow
- Basis points: validate array sums to exactly 10,000
- Social handles: sanitize before passing to API (strip @, validate format)

### Rate Limiting
- 1,000 requests/hour per API key AND per IP
- Implement exponential backoff on 429 responses
- Cache pool data and token info (changes infrequently)
- Don't poll quotes in tight loops; use reasonable intervals

---

## Smart Contract Interaction Safety

### Verify Program IDs
When interacting with Bags on-chain programs, always verify you're calling the correct program:
- Fee Share V1 and V2 program IDs (from SDK constants)
- Meteora DBC program ID
- Meteora DAMM V2 program ID

### Account Validation
- Verify PDA derivations match expected seeds
- Check account owners match expected programs
- Validate account data before deserializing

### Transaction Simulation
Always simulate transactions before submitting:

```typescript
const simulation = await connection.simulateTransaction(tx);
if (simulation.value.err) {
  console.error("Simulation failed:", simulation.value.err);
  // DO NOT submit
}
```

---

## Common Vulnerabilities in Bags Apps

1. **Unsigned fee config changes.** If your app lets users modify fee configs, ensure the admin signature is required and validated.

2. **Front-running token launches.** If your app broadcasts launch intent before the transaction is submitted, snipers can front-run. Keep launch operations atomic.

3. **Claim transaction ordering.** The claim endpoint can return multiple transactions. The last one MUST execute last (especially for partner claims). Executing out of order can fail or lose fees.

4. **Social lookup trust.** The social wallet lookup maps usernames to wallets, but anyone can register any username. Don't use it as an identity verification system.

5. **Quote staleness.** Swap quotes have a `requestId` and are valid for a limited time. Don't cache quotes; fetch fresh ones before each swap.

---

## Production Checklist

Before deploying a Bags app to production:

- [ ] All private keys in environment variables or secret manager
- [ ] API keys not committed to version control
- [ ] `.env` in `.gitignore`
- [ ] Jito MEV protection enabled for all transactions
- [ ] Transaction simulation before submission
- [ ] Slippage bounds configured
- [ ] Fee share basis points validated (sum = 10,000)
- [ ] Rate limiting and backoff implemented
- [ ] Error handling for API failures (network, rate limit, invalid responses)
- [ ] Claim transaction ordering enforced (last tx executes last)
- [ ] No hardcoded addresses (use constants or config)
