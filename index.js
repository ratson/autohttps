'use strict';

var fs = require('fs');
var path = require('path');

var defaults = {
  webrootPath: '~/letsencrypt/var/lib'
, debug: false
};

var Challenger = module.exports;

Challenger.create = function (options) {
  var results = {};

  Object.keys(Challenger).forEach(function (key) {
    results[key] = Challenger[key];
  });

  results._options = options;

  Object.keys(defaults).forEach(function (key) {
    if (!(key in options)) {
      options[key] = defaults[key];
    }
  });

  results.getOptions = function () {
    return results._options;
  };

  return results;
};

Challenger.setChallenge = function (args, domain, challengePath, keyAuthorization, done) {
  var mkdirp = require('mkdirp');

  mkdirp(args.webrootPath, function (err) {
    if (err) {
      done(err);
      return;
    }

    fs.writeFile(path.join(args.webrootPath, challengePath), keyAuthorization, 'utf8', function (err) {
      done(err);
    });
  });
};

Challenger.getChallenge = function (args, domain, key, done) {
  fs.readFile(path.join(args.webrootPath, key), 'utf8', done);
};

Challenger.removeChallenge = function (args, domain, key, done) {
  fs.unlink(path.join(args.webrootPath, key), done);
};
