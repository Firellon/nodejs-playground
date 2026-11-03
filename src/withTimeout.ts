// Your November 3 implementation, kept intentionally close to the original.
// The timeout validation gap is intentionally left for you to fix.
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  if (!isValidTimeout(timeoutMs)) {
    throw new RangeError(`Invalid timeoutMs value provided: [${timeoutMs}]!`);
  }

  const abortController = new AbortController();
  // `| undefined` makes strict type checking happy before assignment.
  let operationTimeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    operationTimeout = setTimeout(() => {
      var timeoutError = new TimeoutError("Operation timeout has expired!", timeoutMs);
      abortController.abort(timeoutError);
      reject(timeoutError);
    }, timeoutMs);
  });
  const operationPromise = new Promise<T>((resolve, reject) => {
    try {
      resolve(operation(abortController.signal));
    } catch (err) {
      reject(err);
    }
  });

  return Promise.race([operationPromise, timeoutPromise])
    .finally(() => clearTimeout(operationTimeout));
}

function isValidTimeout(timeout: number): boolean {
  return isFinite(timeout) && timeout >= 0;
}

export class TimeoutError extends Error {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}
