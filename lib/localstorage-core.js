'use strict';

//
// This is the file forked from localstorage-down's localstorage-core.js file.
// It contains the core storage logic.
//

var fs = require('fs');
var path = require('path');
var sanitizeFilename = require('sanitize-filename');
var collections = new require('pouchdb-collections');
var debounce = require('lodash.debounce');
var mkdirp = require('mkdirp');

var dbs = new collections.Map();

function callbackify(callback, fun) {
  var val;
  var err;
  try {
    val = fun();
  } catch (e) {
    err = e;
  }
  process.nextTick(function () {
    callback(err, val);
  });
}

function LocalStorageCore(dbname) {
  var self = this;
  var filename = path.join.apply(null, dbname.split(path.sep).map(sanitizeFilename)) + '.json';
  if (dbs.has(dbname)) {
    self._db = dbs.get(dbname);
  } else {
    mkdirp.sync(path.dirname(filename));
    self.import(dbname, filename);
  }

  // Periodically write to disk. Yes this is prone to failure, but this module isn't
  // designed to be bullet-proof.
  self._scheduleWrite = debounce(function () {
    var json = JSON.stringify(self.export());
    fs.writeFile(filename, json, 'utf-8', function (error) {
      if (error) {
        console.log('ERROR: ' + filename + ' could not be written');
        console.log(error);
      }
    });
  }, 1000);
}

LocalStorageCore.prototype.getKeys = function (callback) {
  var self = this;
  callbackify(callback, function () {
    var keys = [];
    self._db.forEach(function (value, key) {
      keys.push(key);
    });
    keys.sort();
    return keys;
  });
};

LocalStorageCore.prototype.put = function (key, value, callback) {
  var self = this;
  callbackify(callback, function () {
    self._db.set(key, value);
    self._scheduleWrite();
  });
};

LocalStorageCore.prototype.get = function (key, callback) {
  var self = this;
  callbackify(callback, function () {
    return self._db.get(key);
  });
};

LocalStorageCore.prototype.remove = function (key, callback) {
  var self = this;
  callbackify(callback, function () {
    self._db.delete(key);
    self._scheduleWrite();
  });
};

LocalStorageCore.prototype.import = function (dbname, filename) {
  var data = [];
  // Read from disk once at startup.
  try {
    var json = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    data = Object.keys(json).map(function (key) {
      return [key, json[key]];
    });
  } catch (e) { /* ignore if the file isn't there */ }

  this._db = new collections.Map(data);
  dbs.set(dbname, this._db);
};

LocalStorageCore.prototype.export = function () {
  var result = {};
  this._db.forEach(function (value, key) {
    result[key] = value;
  });
  return result;
};

LocalStorageCore.destroy = function (dbname, callback) {
  var db = dbs.get(dbname);
  callbackify(callback, function () {
    var keys = [];
    db.forEach(function (value, key) {
      keys.push(key);
    });
    keys.forEach(function (key) {
      db.delete(key);
    });
  });
};

module.exports = LocalStorageCore;
