export async function mapConcurrent<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!isLimitValid(limit)) {
    throw new RangeError(`Limit ${limit} is not a positive integer!`);
  }

  const state: MapConcurrentState<R> = {
    currentItemInProgressIndex: 0,
    itemsInProgress: new Map<number, Promise<void>>(),
    processedItems: new Map<number, R>(),
  }

  return await mapConcurrentProcess<T, R>(items, limit, mapper, state);
}

function isLimitValid(limit: number): boolean {
    return Number.isInteger(limit) && limit > 0;
}

type MapConcurrentState<R> = {
  currentItemInProgressIndex: number
  itemsInProgress: Map<number, Promise<void>> 
  processedItems: Map<number, R>
  error?: Error
}
  
async function mapConcurrentProcess<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
  state: MapConcurrentState<R>,
): Promise<R[]> {
  // There was an error, we need to stop processing; is it necessary if we throw anyway?
  if (state.error) {
    throw state.error;
  }

  // Processing is done
  if (state.processedItems.size >= items.length) {
    const processedItems = [...state.processedItems.entries()]
      .sort((entryA, entryB) => entryA[0] - entryB[0])
      .map(entry => entry[1]);
    return processedItems;
  }

  // Processing cannot meaningfully add more items, need to wait until an item is done first
  if (state.currentItemInProgressIndex >= items.length || state.itemsInProgress.size >= limit) {
    await Promise.race([...state.itemsInProgress.values()]);
    return mapConcurrentProcess<T, R>(items, limit, mapper, state);
  }

  // Here we know we can add a new item in progress
  const nextItemIndex = state.currentItemInProgressIndex;
  const nextItem = items[nextItemIndex];
  const itemPromise = mapper(nextItem, nextItemIndex).then(processedItem => {
    state.processedItems.set(nextItemIndex, processedItem);
    state.itemsInProgress.delete(nextItemIndex);
  }).catch((reason) => {
    state.error = new Error(`Error occured while mapping concurrently at index ${nextItemIndex}: ${JSON.stringify(reason)}`);
    throw state.error;
  });
  state.itemsInProgress.set(nextItemIndex, itemPromise);
  state.currentItemInProgressIndex++;
  
  return mapConcurrentProcess<T, R>(items, limit, mapper, state);
}