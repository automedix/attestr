# Contributing to Stashu

Thanks for your interest in contributing to Stashu!

## Development Setup

```bash
git clone https://github.com/keshav0479/Stashu.git
cd Stashu
npm install

# Server environment
cp server/.env.example server/.env
# Edit server/.env — TOKEN_ENCRYPTION_KEY is required:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Client environment (optional — defaults work for local dev)
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
