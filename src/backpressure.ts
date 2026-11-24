import { Writable } from 'node:stream';
import { once } from 'node:events';
import { finished } from 'node:stream/promises';

export async function exportEvents(
    createEvents: (signal: AbortSignal) => AsyncIterable<unknown>,
    destination: Writable
): Promise<void> {
    const controller = new AbortController();
    const { signal } = controller;

    const completion = finished(destination, {
        cleanup: true,
        readable: false
    });

    // Monitor destination failures immediately.
    void completion.catch(error => {
        controller.abort(error);
    });

    try {
        for await (const event of createEvents(signal)) {
            signal.throwIfAborted();

            if (!destination.write(JSON.stringify(event) + '\n')) {
                await once(destination, 'drain', { signal });
            }
        }

        signal.throwIfAborted();

        destination.end();
        await completion;

    } catch (error) {
        controller.abort(error);
        destination.destroy();

        // Wait for stream termination without masking
        // the original failure.
        await completion.catch(() => {});

        throw signal.reason;
    }
}