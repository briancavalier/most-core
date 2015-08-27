/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Observer from './Observer';

export function withScheduler(f, source, scheduler) {
    return new Promise((resolve, reject) => runSource(resolve, reject, f, source, scheduler));
}

function runSource(resolve, reject, f, source, scheduler) {
    var disposable;

    let observer = new Observer(f,
        x => disposeThen(resolve, reject, disposable, x),
        e => disposeThen(reject, reject, disposable, e));

    disposable = source.run(observer, scheduler);
}

function disposeThen(resolve, reject, disposable, x) {
    Promise.resolve(disposable.dispose()).then(() => resolve(x), reject);
}
