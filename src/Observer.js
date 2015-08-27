/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Sink that accepts functions to apply to each event, and to end, and error
 * signals.
 */
export default class Observer {
	/**
	 * @param {function(x:*):void} event function to be applied to each event
	 * @param {function(x:*):void} end function to apply to end signal value.
	 * @param {function(e:Error|*):void} error function to apply to error signal value.
	 */
	constructor (event, end, error) {
        this._event = event;
        this._end = end;
        this._error = error;
        this.active = true;
	}

	event (t, x) {
        if (!this.active) {
            return;
        }
        this._event(x);
	}

	end (t, x) {
        if (!this.active) {
            return;
        }
        this.active = false;
        this._end(x);
	}

	error (t, e) {
        this.active = false;
        this._error(e);
	}
}
