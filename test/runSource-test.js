import { withScheduler } from '../src/runSource';
import assert from 'assert';

describe('runSource', () => {

    describe('withScheduler', () => {

        it('should call source.run with observer and scheduler', () => {
            let expectedScheduler = {};
            let source = {
                run(observer, scheduler) {
                    assert(typeof observer.event === 'function');
                    assert(typeof observer.error === 'function');
                    assert(typeof observer.end === 'function');
                    assert.strictEqual(scheduler, expectedScheduler);
                }
            };

            withScheduler(() => {}, source, expectedScheduler);
        });
    });
});