import { describe, expect, it } from 'vitest';
import { processItems } from '../src/processItems';
/**
 * Requirements:
- Process items in their original order.
- Process at most batchSize items before yielding to the event loop.
- Allow pending timers and I/O callbacks to make progress between batches.
- Reject invalid batchSize values (zero, negative, fractional, NaN, Infinity).
- Propagate exceptions thrown by processItem as Promise rejections.
- Handle 100,000 items without recursive stack growth.
Important: Using await Promise.resolve() or queueMicrotask() is insufficient for yielding to the event loop. You need a mechanism that allows Node.js to reach another event loop phase.
 */


describe('processItems', () => {
    it('rejects negative batch size', async () => {
        var result = [] as never[];

        await expect(processItems([], (item) => result.push(item), -1))
            .rejects.toThrow(
                new RangeError(`Invalid batch size -1!`)
            )
    });

    it('rejects fractional batch size', async () => {
        var result = [] as never[];

        await expect(processItems([], (item) => result.push(item), 0.5))
            .rejects.toThrow(
                new RangeError(`Invalid batch size 0.5!`)
            )
    });

    it('rejects zero batch size', async () => {
        var result = [] as never[];

        await expect(processItems([], (item) => result.push(item), 0))
            .rejects.toThrow(
                new RangeError(`Invalid batch size 0!`)
            )
    });

    it('rejects NaN batch size', async () => {
        var result = [] as never[];

        await expect(processItems([], (item) => result.push(item), NaN))
            .rejects.toThrow(
                new RangeError(`Invalid batch size NaN!`)
            )
    });

    it('rejects Infinity batch size', async () => {
        var result = [] as never[];

        await expect(processItems([], (item) => result.push(item), Infinity))
            .rejects.toThrow(
                new RangeError(`Invalid batch size Infinity!`)
            )
    });

    it('processes an empty batch of items and does nothing', async () => {
        var result = [] as never[];

        await processItems([], (item) => result.push(item), 5);

        expect(result.length).toEqual(0);
    });

    it('processes an empty batch of items and does nothing', async () => {
        var result = [] as never[];

        await processItems([], (item) => result.push(item), 5);

        expect(result.length).toEqual(0);
    });

    it('processes a batch of items smaller than batchSize', async () => {
        var result = [] as number[];

        await processItems([1, 2, 3], (item) => result.push(item), 5);

        expect(result).toEqual([1, 2, 3]);
    });

    it('processes a batch of items bigger than batchSize', async () => {
        var result = [] as number[];

        await processItems([1, 2, 3, 4, 5, 6, 7, 8], (item) => result.push(item), 5);

        expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
});
