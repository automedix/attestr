# Contributing to Stashu

Thanks for your interest in contributing to Stashu!

## Development Setup

```bash
git clone https://github.com/keshav0479/Stashu.git
cd Stashu
npm install

# Server environment
cp server/.env.example server/.env
# Edit server/.env - TOKEN_ENCRYPTION_KEY is required:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Client environment (optional - defaults work for local dev)
cp client/.env.example client/.env

# Start dev servers (client on :5173, server on :3000)
npm run dev
```

## Running Tests

```bash
# All tests
npm test

# Server tests only
npm test --workspace=server

# Single test file
npx tsx --test server/src/lib/encryption.test.ts
```

## Testing with real sats

Stashu uses Cashu mints for payments. For local development, you need access to a mint with real (small amounts of) sats:

| Mint                 | URL                                      | Notes                         |
| -------------------- | ---------------------------------------- | ----------------------------- |
| Minibits             | `https://mint.minibits.cash/Bitcoin`     | Default. Reliable, small fees |
| LNbits (self-hosted) | `http://localhost:5000/cashu/api/v1/...` | Run your own, full control    |

**Getting test sats:**

1. Install [Minibits](https://www.minibits.cash) (mobile) or use [Nutstash](https://nutstash.app) (web)
2. Receive a small Lightning payment (10-100 sats) from a faucet or friend
3. Mint Cashu tokens from the Lightning payment
4. Use those tokens to test the buy flow, or paste invoices for the sell flow

> Cashu operates on mainnet Lightning, so there's no "testnet" mode. Keep test amounts small (10-100 sats). For a fully isolated setup, self-host an [LNbits](https://github.com/lnbits/lnbits) instance with the Cashu extension.

## Code Style

- **Prettier** formats all code on pre-commit (via husky + lint-staged)
- **ESLint** runs on client code: `npm run lint --workspace=client`
- Single quotes, semicolons, 100 char line width, trailing commas (es5)

To check formatting manually:

```bash
npx prettier --check .
```

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run build`, `npm test`, and `npx prettier --check .` all pass
4. Open a PR against `main` with a description of what changed and why

## Project Structure

```
client/    React + Vite + TailwindCSS frontend
server/    Hono + SQLite backend
shared/    TypeScript types shared between client and server
```

## Security Disclosure

If you find a security vulnerability, **do not open a public issue**. Instead, email the maintainer directly or use GitHub's private vulnerability reporting feature.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
