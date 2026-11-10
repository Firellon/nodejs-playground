import { setImmediate } from "node:timers/promises";

export async function processItems<T>(
  items: readonly T[],
  processItem: (item: T) => void,
  batchSize: number
): Promise<void> {
    if (!IsValidBatchSize(batchSize)) {
        throw RangeError(`Invalid batch size ${batchSize}!`);
    }

    var currentBatchSize = 0;
    for (var item of items) {
        processItem(item);
        currentBatchSize++;
        if (currentBatchSize >= batchSize) {
            await setImmediate();
            currentBatchSize = 0;
        }
    }
}

function IsValidBatchSize(batchSize: number): boolean {
    return Number.isInteger(batchSize) && batchSize > 0;
}