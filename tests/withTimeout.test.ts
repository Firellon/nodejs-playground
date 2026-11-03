import { describe, expect, it } from 'vitest';
import { withTimeout } from '../src/withTimeout';

describe('withTimeout', () => {
  it('returns a successful operation result', async () => {
    const result = await withTimeout(async () => 42, 1_000);
    expect(result).toBe(42);
  });

  // Intentionally fails with your current validator: the next TDD exercise.
  it('rejects fractional timeout values', async () => {
    await expect(withTimeout(async () => 42, 1.5))
      .rejects.toBeInstanceOf(RangeError);
  });

  it.todo('rejects negative, NaN, and Infinity timeout values');
  it.todo('propagates the original error if the operation rejects');
  it.todo('handles a synchronous throw from operation');
  it.todo('rejects with TimeoutError when the deadline passes');
  it.todo('aborts the signal on timeout');
  it.todo('does not abort the signal when the operation succeeds');
  it.todo('rejects on time even when the operation ignores abort');
  it.todo('clears its timer after success or failure');
  it.todo('defines and tests its behavior at exactly 0 ms');
});
