'use strict';

var fs = require('fs');
var path = require('path');

var defaults = {
  webrootPath: [ '~', 'letsencrypt', 'var', 'lib' ].join(path.sep)
, debug: false
};

var Challenge = module.exports;

Challenge.create = function (options) {
  var results = {};

  Object.keys(Challenge).forEach(function (key) {
    results[key] = Challenge[key];
  });
  results.create = undefined;

  Object.keys(defaults).forEach(function (key) {
    if (!(key in options)) {
      options[key] = defaults[key];
    }
  });
  results._options = options;

  results.getOptions = function () {
    return results._options;
  };

  return results;
};

Challenge.set = function (defaults, domain, challengePath, keyAuthorization, done) {
  var mkdirp = require('mkdirp');

  mkdirp(defaults.webrootPath, function (err) {
    if (err) {
      done(err);
      return;
    }

    fs.writeFile(path.join(defaults.webrootPath, challengePath), keyAuthorization, 'utf8', function (err) {
      done(err);
    });
  });
};

Challenge.get = function (defaults, domain, key, done) {
  fs.readFile(path.join(defaults.webrootPath, key), 'utf8', done);
};

Challenge.remove = function (defaults, domain, key, done) {
  fs.unlink(path.join(defaults.webrootPath, key), done);
};
