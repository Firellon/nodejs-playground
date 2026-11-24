import { describe, expect, it } from 'vitest';
import { scheduleTest } from '../src/scheduling';
import { setTimeout } from "timers/promises"

describe('scheduling', () => {
    it('prints execution order', async () => {
        const scheduleOutputs: string[] = [];
        scheduleTest((output) => {
            // console.log(`ScheduleTest: ${output}`);
            scheduleOutputs.push(output)
        });
        await setTimeout(0);

        expect(scheduleOutputs[0]).toEqual("A");
        expect(scheduleOutputs[1]).toEqual("G");
        expect(scheduleOutputs[2]).toEqual("B");
        expect(scheduleOutputs[3]).toEqual("D");
        expect(scheduleOutputs[4]).toEqual("C");
        expect(scheduleOutputs[5]).toEqual("F");
        expect(scheduleOutputs[6]).toEqual("E");
    });
});