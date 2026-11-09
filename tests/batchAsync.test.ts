import { describe, expect, it } from 'vitest';
import { batchAsync } from '../src/batchAsync';

async function* numbers(max: number = 0) {
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

    it('rejects fractional batch size', async () => {
        var result = [] as number[][];

        await expect(executeBatchAsync(numbers(), 0.5, (batch) => result.push(batch)))
        .rejects.toThrow(
            new RangeError(`Invalid batch size 0.5!`)
        )
    });

    it('rejects zero batch size', async () => {
        var result = [] as number[][];

        await expect(executeBatchAsync(numbers(), 0, (batch) => result.push(batch)))
        .rejects.toThrow(
            new RangeError(`Invalid batch size 0!`)
        )
    });

    it('rejects NaN batch size', async () => {
        var result = [] as number[][];

        await expect(executeBatchAsync(numbers(), NaN, (batch) => result.push(batch)))
        .rejects.toThrow(
            new RangeError(`Invalid batch size NaN!`)
        )
    });

    it('processes 0 numbers in 0 batches of 3', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(0), 3, (batch) => result.push(batch));

        expect(result.length).toEqual(0);
    });

    it('processes 6 numbers in 2 batches of 3', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(6), 3, (batch) => result.push(batch));

        expect(result.length).toEqual(2);
        expect(result[0]).toEqual([1, 2, 3]);
        expect(result[1]).toEqual([4, 5, 6]);
    });

    it('processes 7 numbers in 3 batches 3', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(7), 3, (batch) => result.push(batch));

        expect(result.length).toEqual(3);
        expect(result[0]).toEqual([1, 2, 3]);
        expect(result[1]).toEqual([4, 5, 6]);
        expect(result[2]).toEqual([7]);
    });

    it('processes 4 numbers in 1 batch of 5', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(4), 5, (batch) => result.push(batch));

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual([1, 2, 3, 4]);
    });

    it('processes 5 numbers in 1 batch of 6', async () => {
        var result = [] as number[][];
        await executeBatchAsync(numbers(5), 6, (batch) => result.push(batch));

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual([1, 2, 3, 4, 5]);
    });
});
