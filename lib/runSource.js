/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.withScheduler = withScheduler;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

function withScheduler(f, source, scheduler) {
    return new Promise(function (resolve, reject) {
        return runSource(resolve, reject, f, source, scheduler);
    });
}

function runSource(resolve, reject, f, source, scheduler) {
    var disposable;

    var observer = new _Observer2['default'](f, function (x) {
        return disposeThen(resolve, reject, disposable, x);
    }, function (e) {
        return disposeThen(reject, reject, disposable, e);
    });

    disposable = source.run(observer, scheduler);
}

function disposeThen(resolve, reject, disposable, x) {
    Promise.resolve(disposable.dispose()).then(function () {
        return resolve(x);
    }, reject);
}