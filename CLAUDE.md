# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Stashu?

Stashu is a pay-to-unlock file sharing platform built on Bitcoin ecash (Cashu protocol). Sellers upload encrypted files, buyers pay with Lightning or Cashu tokens to unlock them. No accounts or passwords — identity is a local Nostr keypair.

## Monorepo Structure

Three npm workspaces: `client/`, `server/`, `shared/`.

- **client** — React 19 + Vite + TailwindCSS 4 frontend
- **server** — Hono + better-sqlite3 + @cashu/cashu-ts backend
- **shared** — TypeScript types shared between client and server (`shared/types.ts`)

## Commands

```bash
# Development (runs client on :5173 and server on :3000 concurrently)
npm run dev

# Run only client or server
npm run dev:client
npm run dev:server

# Build everything
npm run build

# Run server tests (Node test runner with tsx)
npm run test --workspace=server
# or: cd server && npx tsx --test src/**/*.test.ts

# Lint (client only)
npm run lint --workspace=client

# Format check
npx prettier --check .

# Docker
docker compose up --build
```

## Environment Setup

Copy `.env.example` files in both `client/` and `server/`. The server requires a `TOKEN_ENCRYPTION_KEY` (64 hex chars) — it refuses to start without one.

Key server env vars: `MINT_URL`, `CORS_ORIGINS`, `DB_PATH`, `TOKEN_ENCRYPTION_KEY`.
Key client env vars: `VITE_API_URL`, `VITE_BLOSSOM_URL`.

## Architecture

### Authentication

NIP-98 HTTP Auth — the client signs kind 27235 Nostr events and sends them as `Authorization: Nostr <base64>` headers. The server middleware (`server/src/middleware/auth.ts`) verifies the signature, timestamp (±60s), URL, and method. The pubkey from the event identifies the seller.

### Encryption Flow

Files are encrypted client-side with XChaCha20-Poly1305 (`@noble/ciphers`) before upload. The encrypted blob goes to a Blossom server (BUD-02 protocol). The decryption key is stored encrypted on the Stashu server. On purchase, the buyer receives the key to decrypt the file in-browser.

### Payment Flow

1. Buyer requests a Lightning invoice or submits a Cashu token
2. Server verifies payment via the Cashu mint, swaps tokens to claim them
3. Server stores the seller's claimable Cashu token (encrypted at rest)
4. Seller withdraws earnings via Lightning (melt operation)

### Database

SQLite with WAL mode and foreign keys enabled. Schema and migrations are in `server/src/db/index.ts`. Key tables: `stashes`, `payments`, `seller_settings`, `settlement_log`, `change_proofs`, `pending_melts`.

### Crash Recovery

On startup, the server runs recovery routines: `recoverPendingMelts()` for in-flight Lightning payments and `recoverMintFailures()` for failed mint swaps. Stale payment quotes are cleaned up after 1 hour.

### API Response Format

All endpoints return `{ success: true, data: T }` or `{ success: false, error: string }`.

### Routes

Client routes: `/` (home), `/sell` (create stash), `/s/:id` (buyer unlock), `/dashboard` (seller view), `/restore` (import nsec), `/settings` (auto-settlement).

## Code Style

- Prettier: single quotes, semicolons, 100 char print width, trailing commas (es5)
- Pre-commit hook runs Prettier via lint-staged on `*.{ts,tsx,js,jsx,json,css,md}`
- ESLint flat config (v9) on client with React hooks and React refresh plugins
- TypeScript strict mode in both client and server

## CI

GitHub Actions on push to `main` and PRs: `npm ci` → `npm run build` → lint → prettier check. Node 22.
