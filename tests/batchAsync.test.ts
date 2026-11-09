import { describe, expect, it } from 'vitest';
import { batchAsync } from '../src/batchAsync';

async function* numbers(max: number = 7) {
    for (let i = 1; i <= max; i++) {
        yield i;
    }
}

async function executeBatchAsync<T>(
    source: AsyncIterable<T>,
    batchSize: number,
    batchProcessor: (batch: T[]) => void
) {
    for await (const batch of batchAsync(source, batchSize)) {
        batchProcessor(batch);
    }
}

describe('batchAsync', () => {
    it('rejects negative batch size', async () => {
        var result = [] as number[][];

        await expect(executeBatchAsync(numbers(), -1, (batch) => result.push(batch)))
        .rejects.toThrow(
            new RangeError(`Invalid batch size -1!`)
        )
    });

    it('processes numbers in batches #1', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(), 3, (batch) => result.push(batch));

        expect(result.length).toEqual(3);
        expect(result[0]).toEqual([1, 2, 3]);
        expect(result[1]).toEqual([4, 5, 6]);
        expect(result[2]).toEqual([7]);
    });

    it('processes numbers in batches #2', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(4), 5, (batch) => result.push(batch));

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual([1, 2, 3, 4]);
    });
});
