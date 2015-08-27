/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

"use strict";

Object.defineProperty(exports, "__esModule", {
   value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Disposable = (function () {
   function Disposable(f, data) {
      _classCallCheck(this, Disposable);

      this.disposed = false;
      this._dispose = f;
      this._data = data;
   }

   Disposable.prototype.dispose = function dispose() {
      if (this.disposed) {
         return;
      }
      this.disposed = true;
      return this._dispose(this._data);
   };

   return Disposable;
})();

exports["default"] = Disposable;
module.exports = exports["default"];