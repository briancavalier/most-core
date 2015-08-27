/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Sink that accepts functions to apply to each event, and to end, and error
 * signals.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
   value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observer = (function () {
   /**
    * @param {function(x:*):void} event function to be applied to each event
    * @param {function(x:*):void} end function to apply to end signal value.
    * @param {function(e:Error|*):void} error function to apply to error signal value.
    */

   function Observer(event, end, error) {
      _classCallCheck(this, Observer);

      this._event = event;
      this._end = end;
      this._error = error;
      this.active = true;
   }

   Observer.prototype.event = function event(t, x) {
      if (!this.active) {
         return;
      }
      this._event(x);
   };

   Observer.prototype.end = function end(t, x) {
      if (!this.active) {
         return;
      }
      this.active = false;
      this._end(x);
   };

   Observer.prototype.error = function error(t, e) {
      this.active = false;
      this._error(e);
   };

   return Observer;
})();

exports["default"] = Observer;
module.exports = exports["default"];