/**
 * Requirements
1. Yield arrays containing at most batchSize items.
2. Preserve the original order.
3. Yield a smaller final batch if necessary.
4. Reject invalid batch sizes (non-integer or less than 1) with RangeError.
5. Do not load the entire source into memory.
6. Consume the source lazily: do not request the next item until the consumer requests another batch.
7. Propagate errors from the source.
 * @param source 
 * @param batchSize 
 */

export async function* batchAsync<T>(
    source: AsyncIterable<T>,
    batchSize: number
): AsyncGenerator<T[]> {
    if (!IsValidBatchSize(batchSize))
        throw RangeError(`Invalid batch size ${batchSize}!`);

    var batch = [] as T[];
    var currentBatchSize = 0;
    for await (var item of source) {
        batch.push(item);
        currentBatchSize++;

        if (currentBatchSize >= batchSize) {
            yield batch;
            batch = [];
            currentBatchSize = 0;
        }        
    }
    if (currentBatchSize > 0) {
        yield batch;
    }
}

function IsValidBatchSize(batchSize: number): boolean {
    return Number.isInteger(batchSize) && batchSize > 0;
}