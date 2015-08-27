/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

class ScheduledTask {
	constructor (delay, period, task, scheduler) {
        this.time = delay;
        this.period = period;
        this.task = task;
        this.scheduler = scheduler;
        this.active = true;
	}

	run () {
        return this.task.run(this.time);
	}

	error (e) {
        return this.task.error(this.time, e);
	}

	cancel () {
        this.scheduler.cancel(this);
        return this.task.dispose();
	}
}

function runTask(task) {
    try {
        return task.run();
    } catch (e) {
        return task.error(e);
    }
}

export default class Scheduler {
	constructor (setTimer, clearTimer, now) {
        this.now = now;
        this._setTimer = setTimer;
        this._clearTimer = clearTimer;

        this._timer = null;
        this._nextArrival = 0;
        this._tasks = [];

        this._runReadyTasksBound = () => this._runReadyTasks(this.now());
	}

	asap (task) {
        return this.schedule(0, -1, task);
	}

	delay (delay, task) {
        return this.schedule(delay, -1, task);
	}

	periodic (period, task) {
        return this.schedule(0, period, task);
	}

	schedule (delay, period, task) {
        let now = this.now();
        let st = new ScheduledTask(now + Math.max(0, delay), period, task, this);

        insertByTime(st, this._tasks);
        this._scheduleNextRun(now);
        return st;
	}

	cancel (task) {
        task.active = false;
        let i = binarySearch(task.time, this._tasks);

        if (i >= 0 && i < this._tasks.length) {
            removeEvent(task, this._tasks[i]);
            this._reschedule();
        }
	}

	cancelAll (f) {
        this._tasks = removeAll(f, this._tasks);
        this._reschedule();
	}

	_reschedule () {
        if (this._tasks.length === 0) {
            this._unschedule();
        } else {
            this._scheduleNextRun(this.now());
        }
	}

	_unschedule () {
        this._clearTimer(this._timer);
        this._timer = null;
	}

	_scheduleNextRun (now) {
        if (this._tasks.length === 0) {
            return;
        }

        let nextArrival = this._tasks[0].time;

        if (this._timer === null) {
            this._scheduleNextArrival(nextArrival, now);
        } else if (nextArrival < this._nextArrival) {
            this._unschedule();
            this._scheduleNextArrival(nextArrival, now);
        }
	}

	_scheduleNextArrival (nextArrival, now) {
        this._nextArrival = nextArrival;
        this._timer = this._setTimer(this._runReadyTasksBound, Math.max(0, nextArrival - now));
	}

	_runReadyTasks (now) {
        this._timer = null;
        this._findAndRunTasks(now);
        this._scheduleNextRun(this.now());
	}

	_findAndRunTasks (now) {
        let tasks = this._tasks;

        let l = tasks.length;
        let i = 0;

        while (i < l && tasks[i].time <= now) {
            ++i;
        }

        this._tasks = tasks.slice(i);

        // Run all ready tasks
        for (let j = 0; j < i; ++j) {
            runTasks(tasks[j], this._tasks);
        }
	}
}


function runTasks(timeslot, tasks) {
    let events = timeslot.events;
    for (let i = 0; i < events.length; ++i) {
        let task = events[i];

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
    let l = timeslots.length;

    if (l === 0) {
        timeslots.push(newTimeslot(task.time, [task]));
        return;
    }

    let i = binarySearch(task.time, timeslots);

    if (i >= l) {
        timeslots.push(newTimeslot(task.time, [task]));
    } else if (task.time === timeslots[i].time) {
        addEvent(task, timeslots[i]);
    } else {
        timeslots.splice(i, 0, newTimeslot(task.time, [task]));
    }
}

function binarySearch(t, sortedArray) {
    let lo = 0;
    let hi = sortedArray.length;
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
    for (let i = 0, l = a.length; i < l; ++i) {
        if (x === a[i]) {
            return i;
        }
    }
    return -1;
}

function removeAll(f, a) {
    let l = a.length;
    let b = new Array(l);
    var x;
    for (let i = 0, j = 0; i < l; ++i) {
        x = a[i];
        if (!f(x)) {
            b[j] = x;
            ++j;
        }
    }

    b.length = j;
    return b;
}
