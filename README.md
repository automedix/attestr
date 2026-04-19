# attestr

<div align="center">
  <h1>attestr</h1>
  <p>
    <strong>Schnelle Bezahlung kostenpflichtiger Atteste per Lightning</strong>
  </p>
  <p>
    <a href="https://github.com/automedix/attestr">GitHub</a>
  </p>
</div>

---

## Über attestr

attestr ist ein **Fork von [Stashu](https://github.com/keshav0479/Stashu)** – einem Open-Source Pay-to-Unlock File Sharing System von Keshav – und wurde speziell für Bezahlung und Übermittlung von kostenpflichtigen Attesten in Videokonsultationen angepasst.

**Was sich geändert hat:**
- Spezialisierung auf kostenpflichtige Atteste (statt genereller Dateiverkäufe)
- Anpassung an Workflows in Arztpraxen

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | React 19, Vite, TypeScript, TailwindCSS 4 |
| Backend    | Hono, TypeScript, better-sqlite3          |
| Database   | SQLite (WAL mode, foreign keys)           |
| Storage    | Blossom (BUD-02 protocol)                 |
| Encryption | XChaCha20-Poly1305 (`@noble/ciphers`)     |
| Payment    | Cashu ecash + Lightning (LUD-16)          |
| Identity   | Local Nostr keypair with nsec recovery    |
| Auth       | NIP-98 HTTP Auth (Nostr event signatures) |

## Quick Start

```bash
git clone https://github.com/automedix/attestr.git
cd attestr
npm install

# Configure environment
cp server/.env.example server/.env
# server/.env requires TOKEN_ENCRYPTION_KEY, generate one:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

cp client/.env.example client/.env  # Optional, defaults work for local dev

npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3000

## Development & Testing

```bash
# Run everything
npm run dev

# Run only client or server
npm run dev:client
npm run dev:server

# Build
npm run build

# Test
npm run test --workspace=server
npm run test --workspace=client

# Lint (client)
npm run lint --workspace=client

# Format check
npx prettier --check .

# Docker
docker compose up --build
```

### Environment Variables

**Server** (required):

- `TOKEN_ENCRYPTION_KEY` - 64 hex chars. Server refuses to start without it.
- `MINT_URL` - Cashu mint URL
- `CORS_ORIGINS` - Allowed origins
- `DB_PATH` - SQLite database path

**Client** (optional, defaults work for dev):

- `VITE_API_URL` - Server API URL
- `VITE_BLOSSOM_URL` - Blossom server URL

## License

MIT - Siehe [LICENSE](LICENSE)

This project is a fork of [Stashu](https://github.com/keshav0479/Stashu) by Keshav, licensed under MIT.
