<!-- AD_TPL_BEGIN -->

About Daplie: We're taking back the Internet!
--------------

Down with Google, Apple, and Facebook!

We're re-decentralizing the web and making it read-write again - one home cloud system at a time.

Tired of serving the Empire? Come join the Rebel Alliance:

<a href="mailto:jobs@daplie.com">jobs@daplie.com</a> | [Invest in Daplie on Wefunder](https://daplie.com/invest/) | [Pre-order Cloud](https://daplie.com/preorder/), The World's First Home Server for Everyone

<!-- AD_TPL_END -->

le-challenge-sni
================

A strategy for node-letsencrypt for setting, retrieving, and clearing ACME
challenges by registering self-signed certs with the SNI handler.

It is designed to handle tls-sni-01 and tls-sni-02 challenges.

Install
-------

```bash
npm install --save le-challenge-sni@2.x
```

Usage
-----

```javascript
var leChallenge = require('le-challenge-sni').create({
  debug: false
});

var LE = require('letsencrypt');

LE.create({
  server: LE.stagingServerUrl
, challengeType: "tls-sni-01"
, challenge: leChallenge
});
```

`le-challenge-sni` requires the `sni` option to `letsencrypt` to have
`cacheCerts` and `uncacheCerts` methods. These are used to register/unregister
the certificates. The default `le-sni-auto` instance satisfies this
requirement.

It also requires the `challengeType` option to `letsencrypt` to be either
`tls-sni-01` or `tls-sni-02` and will generate and register certificates
accordingly.

Exposed Methods
---------------

For ACME Challenge:

* `set(opts, domain, key, val, done)`
* `get(defaults, domain, key, done)`
* `remove(defaults, domain, key, done)`

For node-letsencrypt internals:

* `getOptions()` returns the user supplied options, if any (no effect)
