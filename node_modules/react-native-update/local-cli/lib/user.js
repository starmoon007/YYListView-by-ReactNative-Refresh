'use strict';

var _utils = require('./utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by tdzl2003 on 2/13/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _require = require('./api');

const post = _require.post;
const get = _require.get;
const replaceSession = _require.replaceSession;
const saveSession = _require.saveSession;
const closeSession = _require.closeSession;

const crypto = require('crypto');

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

exports.commands = {
  login: function () {
    var ref = _asyncToGenerator(function* (_ref) {
      let args = _ref.args;

      const email = args[0] || (yield (0, _utils.question)('email:'));
      const pwd = args[1] || (yield (0, _utils.question)('password:', true));

      var _ref2 = yield post('/user/login', {
        email,
        pwd: md5(pwd)
      });

      const token = _ref2.token;
      const info = _ref2.info;

      replaceSession({ token });
      yield saveSession();
      console.log(`Welcome, ${ info.name }.`);
    });

    return function login(_x) {
      return ref.apply(this, arguments);
    };
  }(),
  logout: function () {
    var ref = _asyncToGenerator(function* () {
      yield closeSession();
      console.log('Logged out.');
    });

    return function logout() {
      return ref.apply(this, arguments);
    };
  }(),
  me: function () {
    var ref = _asyncToGenerator(function* () {
      const me = yield get('/user/me');
      for (const k in me) {
        if (k !== 'ok') {
          console.log(`${ k }: ${ me[k] }`);
        }
      }
    });

    return function me() {
      return ref.apply(this, arguments);
    };
  }()
};