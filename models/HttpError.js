'use strict';

var recursion = 0;
var debugOn = false;
var memStat = false;

var debug = function() {
  if (debugOn) {
    var args = memStat ? Array.from(arguments).concat([process.memoryUsage()]) : Array.from(arguments);
    console.log.apply(this, args);
  }
};

class HttpError extends Error {
  constructor(code, message, err) {
    var handledFlag = false;

    if (code instanceof HttpError) {
      debug('HttpError');
      return code;
    }

    if (code instanceof Error) {
      debug('Error');
      err = code;
      code = err.code;
      message = message || err.message;
    }

    if (typeof code == 'string' && parseInt(code) !== code) {
      debug('message/message+object');
      err = typeof message == 'object' ? message : err;
      message = code;
      code = err && err.code;
    }

    if (typeof code == 'object') {
      debug('object');
      let handled = HttpError.handleErrorObject(code);

      code = handled.code;
      message = handled.message;
      err = handled.err;
      handledFlag = true;
    }

    if (typeof message == 'object') {
      debug('code+object');
      err = message;
      message = err.message;
    }

    if (!handledFlag && typeof err == 'object' && !(err instanceof Error)) {
      debug('code+object/code+message+object');
      let handled = HttpError.handleErrorObject(err);

      err = handled.err;
      message = message || handled && handled.message || err && err.message;
      err && err.message || err && err[0] && err[0].message || 'Undefined error';
      code = parseInt(code) || handled && handled.code || err && err.code || err && err[0] && err[0].code;
      // debug('Not instance of Error object\r\n', handled.message, handled.err);
    }

    super(message);

    this.code = code || 500;
    this.error = err;
  }

  static handleErrorObject(object) {
    recursion++;

    debug('Recursion', recursion);
    if (recursion > 10) { return { message: 'Undefined error' }; }

    var code,
        message,
        err;

    if (Array.isArray(object)) {
      message = '';

      debug(object);

      err = object.filter(v => {
        if (v instanceof Error) {
          debug(`${v} instanse of Error`);
          message += '\n' + v.message;
          return v;
        }

        return false;
      });

      debug(err);

      message = message || 'Multiple errors detected';

      if (!err.length) {
        err = undefined;
      } else {
        err =  err.length == 1 ? err[0] : err;
        message = message || err && err.message || err && err[0] && err[0].message || 'Undefined error';
        code = err & err.code || err && err[0] && err[0].code;
      }
    } else {
      object = object || {};
      message = object.message;
      err = object.error;
      code = object.code;

      debug(object.code);

      if (err && typeof err == 'object') {
        if (!(err instanceof Error)) {
          var handled = HttpError.handleErrorObject(err);
          err =  handled.err;
          code = code || handled && handled.code || err && err.code || err && err[0] && err[0].code;
          message = message || handled && handled.message || err && err.message || err && err[0] && err[0].message;
        }

        debug(code);
        code = code || err && err.code;
        message = message || err && err.message;
      }

      message = message || 'Undefined error';
    }

    err = err && err.length == 1 ? err[0] : err;
    recursion = 0;

    return { code: code, message: message, err: err };
  }
}

module.exports = HttpError;
