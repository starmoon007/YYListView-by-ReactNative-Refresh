'use strict';

var _fs = require('fs');

var fsOrigin = _interopRequireWildcard(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by tdzl2003 on 2/13/16.
 */

const fetch = require('isomorphic-fetch');
let host = process.env.PUSHY_REGISTRY || 'http://update.reactnative.cn/api';
const fs = require('fs-promise');


let session = undefined;
let savedSession = undefined;

exports.loadSession = _asyncToGenerator(function* () {
  if (yield fs.exists('.update')) {
    try {
      exports.replaceSession(JSON.parse((yield fs.readFile('.update', 'utf8'))));
      savedSession = session;
    } catch (e) {
      console.error('Failed to parse file `.update`. Try to remove it manually.');
      throw e;
    }
  }
});

exports.getSession = function () {
  return session;
};

exports.replaceSession = function (newSession) {
  session = newSession;
};

exports.saveSession = _asyncToGenerator(function* () {
  // Only save on change.
  if (session !== savedSession) {
    const current = session;
    const data = JSON.stringify(current, null, 4);
    yield fs.writeFile('.update', data, 'utf8');
    savedSession = current;
  }
});

exports.closeSession = _asyncToGenerator(function* () {
  if (yield fs.exists('.update')) {
    yield fs.unlink('.update');
    savedSession = undefined;
  }
  session = undefined;
  host = process.env.PUSHY_REGISTRY || 'http://update.reactnative.cn';
});

let query = function () {
  var ref = _asyncToGenerator(function* (url, options) {
    const resp = yield fetch(url, options);
    const json = yield resp.json();
    if (resp.status !== 200) {
      throw Object.assign(new Error(json.message || json.error), { status: resp.status });
    }
    return json;
  });

  return function query(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

function queryWithoutBody(method) {
  return function (api) {
    return query(host + api, {
      method,
      headers: {
        'X-AccessToken': session ? session.token : ''
      }
    });
  };
}

function queryWithBody(method) {
  return function (api, body) {
    return query(host + api, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-AccessToken': session ? session.token : ''
      },
      body: JSON.stringify(body)
    });
  };
}

exports.get = queryWithoutBody('GET');
exports.post = queryWithBody('POST');
exports.put = queryWithBody('PUT');
exports.doDelete = queryWithBody('DELETE');

let uploadFile = function () {
  var ref = _asyncToGenerator(function* (fn) {
    var _ref = yield exports.post('/upload', {});

    const url = _ref.url;
    const fieldName = _ref.fieldName;
    const formData = _ref.formData;

    let realUrl = url;

    if (!/^https?\:\/\//.test(url)) {
      realUrl = host + url;
    }

    const fileSize = (yield fs.stat(fn)).size;

    const bar = new _progress2.default('  Uploading [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      total: fileSize
    });

    const info = yield new Promise(function (resolve, reject) {
      formData.file = fsOrigin.createReadStream(fn);

      formData.file.on('data', function (data) {
        bar.tick(data.length);
      });
      _request2.default.post(realUrl, {
        formData
      }, function (err, resp, body) {
        if (err) {
          return reject(err);
        }
        if (resp.statusCode > 299) {
          return reject(Object.assign(new Error(body), { status: resp.statusCode }));
        }
        resolve(JSON.parse(body));
      });
    });
    return info;
  });

  return function uploadFile(_x3) {
    return ref.apply(this, arguments);
  };
}();

exports.uploadFile = uploadFile;