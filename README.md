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

## Today's challenge: withTimeout

The current implementation is copied from the 2026-11-03 solution, with only an optional `undefined` timer type added to satisfy strict typing and test code moved out. `isValidTimeout` intentionally retains the non-integer bug.

Complete the TODO test cases yourself. Test outcomes using `expect(...).resolves` and `expect(...).rejects`, not `console.log`. For deterministic timing tests, investigate Vitest's `vi.useFakeTimers()` and `vi.advanceTimersByTimeAsync()`; restore real timers after each test.

Important: cooperative cancellation does **not** stop a signal-ignoring operation; it only lets `withTimeout` reject while the underlying work may continue.

When done, add your implementation notes to this README or a dated Markdown session log and commit the files to Git.
