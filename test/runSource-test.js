import { withScheduler } from '../src/runSource';
import assert from 'assert';

let asap = process.nextTick || ((f, ...args) => setTimeout(f, 0, ...args));

describe('runSource', () => {

    describe('withScheduler', () => {

        it('should call source.run with observer and scheduler', () => {
            let expectedScheduler = {};
            let runCalled = false;
            let source = {
                run(observer, scheduler) {
                    runCalled = true;
                    assert(typeof observer.event === 'function');
                    assert(typeof observer.error === 'function');
                    assert(typeof observer.end === 'function');
                    assert.strictEqual(scheduler, expectedScheduler);
                    asap(observer => observer.end(0, 0), observer);
                    return { dispose() {} };
                }
            };

            return withScheduler(() => {}, source, expectedScheduler)
                .then(() => assert(runCalled));
        });

        it('should dispose on end', () => {
            let disposed = false;
            let disposer = { dispose() { disposed = true; }};
            let source = {
                run(observer) {
                    asap(observer => observer.end(0, 0), observer);
                    return disposer;
                }
            };

            return withScheduler(() => {}, source, {})
                .then(() => assert(disposed));

        });

        it('should propagate end value', () => {
            let disposer = { dispose() {} };
            let expected = {};
            let source = {
                run(observer) {
                    asap(observer => observer.end(0, expected), observer);
                    return disposer;
                }
            };

            return withScheduler(() => {}, source, {})
                .then(x => assert.strictEqual(expected, x));

        });

        it('should dispose on error', () => {
            let disposed = false;
            let disposer = { dispose() { disposed = true; }};
            let source = {
                run(observer) {
                    asap(observer => observer.error(0, 0), observer);
                    return disposer;
                }
            };

            return withScheduler(() => {}, source, {})
                .then(assert.ifError, () => assert(disposed));

        });

        it('should propagate error value', () => {
            let disposer = { dispose() {} };
            let expected = {};
            let source = {
                run(observer) {
                    asap(observer => observer.error(0, expected), observer);
                    return disposer;
                }
            };

            return withScheduler(() => {}, source, {})
                .then(assert.ifError, x => assert.strictEqual(expected, x));

        });

        it('should call f with event values', () => {
            let disposer = { dispose() {} };
            let event = {};
            let count = 0;
            let f = x => {
                assert.strictEqual(event, x);
                count++;
            };

            let source = {
                run(observer) {
                    asap(observer => observer.event(0, event), observer);
                    asap(observer => observer.event(0, event), observer);
                    asap(observer => observer.end(0, 0), observer);
                    return disposer;
                }
            };

            return withScheduler(f, source, {})
                .then(() => assert.equal(count, 2));
        });

        it('should not call f after end', () => {
            let disposer = { dispose() {} };
            let count = 0;
            let f = () => count++;

            let source = {
                run(observer) {
                    asap(observer => observer.event(0, 0), observer);
                    asap(observer => observer.end(0, 0), observer);
                    asap(observer => observer.event(0, 0), observer);
                    return disposer;
                }
            };

            return withScheduler(f, source, {})
                .then(() => assert.equal(count, 1));
        });

        it('should not call end after end', () => {
            let disposer = { dispose() {} };
            let f = () => {};

            let source = {
                run(observer) {
                    asap(observer => observer.end(0, 0), observer);
                    asap(observer => observer.end(0, 1), observer);
                    return disposer;
                }
            };

            return withScheduler(f, source, {})
                .then(x => assert.equal(0, x));
        });

        it('should not call f after error', () => {
            let disposer = { dispose() {} };
            let count = 0;
            let f = () => count++;

            let source = {
                run(observer) {
                    asap(observer => observer.event(0, 0), observer);
                    asap(observer => observer.error(0, 0), observer);
                    asap(observer => observer.event(0, 0), observer);
                    return disposer;
                }
            };

            return withScheduler(f, source, {})
                .then(assert.ifError, () => assert.equal(count, 1));
        });

        it('should not call end after error', () => {
            let disposer = { dispose() {} };
            let f = () => {};

            let source = {
                run(observer) {
                    asap(observer => observer.error(0, 0), observer);
                    asap(observer => observer.end(0, 1), observer);
                    return disposer;
                }
            };

            return withScheduler(f, source, {})
                .then(assert.ifError, x => assert.equal(0, x));
        });
    });
});