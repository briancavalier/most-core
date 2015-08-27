/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

export default class Disposable {
	constructor (f, data) {
    this.disposed = false;
    this._dispose = f;
    this._data = data;
	}

	dispose () {
    if (this.disposed) {
        return;
    }
    this.disposed = true;
    return this._dispose(this._data);
	}
}
