export function scheduleTest(callback: (output: string) => void) {
    callback('A');

    Promise.resolve().then(() => {
        callback('B');

        process.nextTick(() => callback('C'));
        queueMicrotask(() => callback('D'));
    });

    setTimeout(() => callback('E'), 0);
    setImmediate(() => callback('F'));

    callback('G');
}
