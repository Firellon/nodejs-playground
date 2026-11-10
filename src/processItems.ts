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
        if (currentBatchSize >= batchSize) {
            await setImmediate();
            currentBatchSize = 0;
        }
        processItem(item);
        currentBatchSize++;
    }
}

function IsValidBatchSize(batchSize: number): boolean {
    return Number.isInteger(batchSize) && batchSize > 0;
}