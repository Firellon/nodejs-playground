# Backend Interview Preparation

Persistent TypeScript / Node.js practice repository. Store each challenge under `src/` and its tests under `tests/`.

## Requirements

Node.js >= 22.12.0 and npm.

## Setup

```bash
npm install
npm test
```

The initial suite intentionally contains **one failing test**: fractional timeout values must be rejected, but the original implementation permits them.

## Commands

- `npm test` — run tests once (use when an exercise is complete)
- `npm run test:watch` — rerun tests after every code change
- `npm run typecheck` — TypeScript strict type check; note that running tests alone does not type-check your source

## Exercise layout

```text
src/
  withTimeout.ts
  mapConcurrent.ts        # Add later, if useful
  parseUser.ts            # Add later, if useful
tests/
  withTimeout.test.ts
  mapConcurrent.test.ts    # Add later
  parseUser.test.ts       # Add later
```