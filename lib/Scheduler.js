/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScheduledTask = (function () {
    function ScheduledTask(delay, period, task, scheduler) {
        _classCallCheck(this, ScheduledTask);

        this.time = delay;
        this.period = period;
        this.task = task;
        this.scheduler = scheduler;
        this.active = true;
    }

    ScheduledTask.prototype.run = function run() {
        return this.task.run(this.time);
    };

    ScheduledTask.prototype.error = function error(e) {
        return this.task.error(this.time, e);
    };

    ScheduledTask.prototype.cancel = function cancel() {
        this.scheduler.cancel(this);
        return this.task.dispose();
    };

    return ScheduledTask;
})();

function runTask(task) {
    try {
        return task.run();
    } catch (e) {
        return task.error(e);
    }
}

var Scheduler = (function () {
    function Scheduler(setTimer, clearTimer, now) {
        var _this = this;

        _classCallCheck(this, Scheduler);

        this.now = now;
        this._setTimer = setTimer;
        this._clearTimer = clearTimer;

        this._timer = null;
        this._nextArrival = 0;
        this._tasks = [];

        this._runReadyTasksBound = function () {
            return _this._runReadyTasks(_this.now());
        };
    }

    Scheduler.prototype.asap = function asap(task) {
        return this.schedule(0, -1, task);
    };

    Scheduler.prototype.delay = function delay(_delay, task) {
        return this.schedule(_delay, -1, task);
    };

    Scheduler.prototype.periodic = function periodic(period, task) {
        return this.schedule(0, period, task);
    };

    Scheduler.prototype.schedule = function schedule(delay, period, task) {
        var now = this.now();
        var st = new ScheduledTask(now + Math.max(0, delay), period, task, this);

        insertByTime(st, this._tasks);
        this._scheduleNextRun(now);
        return st;
    };

    Scheduler.prototype.cancel = function cancel(task) {
        task.active = false;
        var i = binarySearch(task.time, this._tasks);

        if (i >= 0 && i < this._tasks.length) {
            removeEvent(task, this._tasks[i]);
            this._reschedule();
        }
    };

    Scheduler.prototype.cancelAll = function cancelAll(f) {
        this._tasks = removeAll(f, this._tasks);
        this._reschedule();
    };

    Scheduler.prototype._reschedule = function _reschedule() {
        if (this._tasks.length === 0) {
            this._unschedule();
        } else {
            this._scheduleNextRun(this.now());
        }
    };

    Scheduler.prototype._unschedule = function _unschedule() {
        this._clearTimer(this._timer);
        this._timer = null;
    };

    Scheduler.prototype._scheduleNextRun = function _scheduleNextRun(now) {
        if (this._tasks.length === 0) {
            return;
        }

        var nextArrival = this._tasks[0].time;

        if (this._timer === null) {
            this._scheduleNextArrival(nextArrival, now);
        } else if (nextArrival < this._nextArrival) {
            this._unschedule();
            this._scheduleNextArrival(nextArrival, now);
        }
    };

    Scheduler.prototype._scheduleNextArrival = function _scheduleNextArrival(nextArrival, now) {
        this._nextArrival = nextArrival;
        this._timer = this._setTimer(this._runReadyTasksBound, Math.max(0, nextArrival - now));
    };

    Scheduler.prototype._runReadyTasks = function _runReadyTasks(now) {
        this._timer = null;
        this._findAndRunTasks(now);
        this._scheduleNextRun(this.now());
    };

    Scheduler.prototype._findAndRunTasks = function _findAndRunTasks(now) {
        var tasks = this._tasks;

        var l = tasks.length;
        var i = 0;

        while (i < l && tasks[i].time <= now) {
            ++i;
        }

        this._tasks = tasks.slice(i);

        // Run all ready tasks
        for (var _j = 0; _j < i; ++_j) {
            runTasks(tasks[_j], this._tasks);
        }
    };

    return Scheduler;
})();

exports["default"] = Scheduler;

function runTasks(timeslot, tasks) {
    var events = timeslot.events;
    for (var i = 0; i < events.length; ++i) {
        var task = events[i];

        if (task.active) {
            runTask(task);

            // Reschedule periodic repeating tasks
            // Check active again, since a task may have canceled itself
            if (task.period >= 0) {
                task.time = task.time + task.period;
                insertByTime(task, tasks);
            }
        }
    }
}

function insertByTime(task, timeslots) {
    var l = timeslots.length;

    if (l === 0) {
        timeslots.push(newTimeslot(task.time, [task]));
        return;
    }

    var i = binarySearch(task.time, timeslots);

    if (i >= l) {
        timeslots.push(newTimeslot(task.time, [task]));
    } else if (task.time === timeslots[i].time) {
        addEvent(task, timeslots[i]);
    } else {
        timeslots.splice(i, 0, newTimeslot(task.time, [task]));
    }
}

function binarySearch(t, sortedArray) {
    var lo = 0;
    var hi = sortedArray.length;
    var mid, y;

    while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        y = sortedArray[mid];

        if (t === y.time) {
            return mid;
        } else if (t < y.time) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return hi;
}

function newTimeslot(t, events) {
    return { time: t, events: events };
}

function addEvent(event, timeslot) {
    timeslot.events.push(event);
}

function removeEvent(event, timeslot) {
    timeslot.events.splice(findIndex(event, timeslot.events), 1);
}

function findIndex(x, a) {
    for (var i = 0, l = a.length; i < l; ++i) {
        if (x === a[i]) {
            return i;
        }
    }
    return -1;
}

function removeAll(f, a) {
    var l = a.length;
    var b = new Array(l);
    var x;
    for (var i = 0, _j2 = 0; i < l; ++i) {
        x = a[i];
        if (!f(x)) {
            b[_j2] = x;
            ++_j2;
        }
    }

    b.length = j;
    return b;
}
module.exports = exports["default"];