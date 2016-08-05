# le-challenge-fs

A fs-based strategy for node-letsencrypt for setting, retrieving,
and clearing ACME challenges issued by the ACME server

This places the acme challenge in an appropriate directory in the specified `webrootPath`
and removes it once the challenge has either completed or failed.

* Safe to use with node cluster
* Safe to use with ephemeral services (Heroku, Joyent, etc)

Install
-------

```bash
npm install --save le-challenge-fs@2.x
```

Usage
-----

```bash
var leChallenge = require('le-challenge-fs').create({
  webrootPath: '~/letsencrypt/srv/www/:hostname/.well-known/acme-challenge'
, debug: false
});

var LE = require('letsencrypt');

LE.create({
  server: LE.stagingServerUrl                               // Change to LE.productionServerUrl in production
, challenge: leChallenge
});
```

Exposed Methods
---------------

For ACME Challenge:

* `setChallange(opts, domain, key, val, done)`
* `getChallange(domain, key, done)`
* `removeChallange(domain, key, done)`

For node-letsencrypt internals:

* `getOptions()` returns the internal defaults merged with the user-supplied options
