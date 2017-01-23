'use strict';

var fs = require('fs');
var levelup = require('levelup');
var lolex = require('lolex');
var rimraf = require('rimraf');

module.exports.setUp = function (leveldown, test, testCommon) {
  test('setUp common', testCommon.setUp);
  test('setUp db', function (t) {
    var db = leveldown(testCommon.location());
    db.open(t.end.bind(t));
  });
};

module.exports.all = function (leveldown, test, testCommon) {
  module.exports.setUp(leveldown, test, testCommon);

  test('writes file', function (t) {
    var clock = lolex.install();

    rimraf.sync('.fsdown/persistence-write-test');
    var db = levelup('.fsdown/persistence-write-test', {db: leveldown});
    db.put('foo', 'bar', function (err) {
      t.error(err);

      clock.tick(1000);
      clock.uninstall();

      fs.readFile('.fsdown/persistence-write-test.json', 'utf-8', function (err, data) {
        t.error(err);

        t.is(data, '{"foo":"bar"}');
        t.end();
      });
    });
  });

  test('reads file', function (t) {
    fs.writeFileSync('.fsdown/persistence-read-test.json', '{"foo":"bar"}', 'utf-8');
    var db = levelup('.fsdown/persistence-read-test', {db: leveldown});
    db.get('foo', function (err, value) {
      t.error(err);

      t.is(value, 'bar');
      t.end();
    });
  });
};
