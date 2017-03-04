autohttps
=========

Automatic [Let's Encrypt](https://letsencrypt.org) (ACME) HTTPS / TLS / SSL Certificates for node.js

Free SSL with [90-day](https://letsencrypt.org/2015/11/09/why-90-days.html) HTTPS / TLS Certificates

Install
=======

`autohttps` requires at least two plugins:
one for managing certificate storage and the other for handling ACME challenges.

The default storage plugin is [`le-store-certbot`](https://github.com/Daplie/le-store-certbot)
and the default challenge is [`le-challenge-fs`](https://github.com/Daplie/le-challenge-fs).

```bash
npm install autohttps --save

npm install --save le-store-certbot@2.x   # default plugin for accounts, certificates, and keypairs
npm install --save le-challenge-fs@2.x    # default plugin for challenge handlers
npm install --save le-acme-core@2.x       # default plugin for ACME spec
npm install --save le-sni-auto@2.x        # default plugin for SNICallback
```

Usage
=====

It's very simple and easy to use, but also very complete and easy to extend and customize.

### Overly Simplified Example

Against my better judgement I'm providing a terribly oversimplified example
of how to use this library:

```javascript
var le = require('autohttps').create({ server: 'staging' });

var opts = {
  domains: ['example.com'], email: 'user@email.com', agreeTos: true
};

le.register(opts).then(function (certs) {
  console.log(certs);
  // privkey, cert, chain, expiresAt, issuedAt, subject, altnames
}, function (err) {
  console.error(err);
});
```

You also need some sort of server to handle the acme challenge:

```javascript
var app = express();
app.use('/', le.middleware());
```

Note: The `webrootPath` string is a template.
Any occurance of `:hostname` will be replaced
with the domain for which we are requested certificates.

### Useful Example

The configuration consists of 3 components:

* Storage Backend (search npm for projects starting with 'le-store-')
* ACME Challenge Handlers (search npm for projects starting with 'le-challenge-')
* Letsencryt Config (this is all you)

```javascript
'use strict';

var LE = require('autohttps');
var le;


// Storage Backend
var leStore = require('le-store-certbot').create({
  configDir: '~/letsencrypt/etc'                          // or /etc/letsencrypt or wherever
, debug: false
});


// ACME Challenge Handlers
var leChallenge = require('le-challenge-fs').create({
  webrootPath: '~/letsencrypt/var/'                       // or template string such as
, debug: false                                            // '/srv/www/:hostname/.well-known/acme-challenge'
});


function leAgree(opts, agreeCb) {
  // opts = { email, domains, tosUrl }
  agreeCb(null, opts.tosUrl);
}

le = LE.create({
  server: LE.stagingServerUrl                             // or LE.productionServerUrl
, store: leStore                                          // handles saving of config, accounts, and certificates
, challenges: { 'http-01': leChallenge }                  // handles /.well-known/acme-challege keys and tokens
, challengeType: 'http-01'                                // default to this challenge type
, agreeToTerms: leAgree                                   // hook to allow user to view and accept LE TOS
//, sni: require('le-sni-auto').create({})                // handles sni callback
, debug: false
//, log: function (debug) {console.log.apply(console, args);} // handles debug outputs
});


// If using express you should use the middleware
// app.use('/', le.middleware());
//
// Otherwise you should see the test file for usage of this:
// le.challenges['http-01'].get(opts.domain, key, val, done)



// Check in-memory cache of certificates for the named domain
le.check({ domains: [ 'example.com' ] }).then(function (results) {
  if (results) {
    // we already have certificates
    return;
  }


  // Register Certificate manually
  le.register({

    domains: ['example.com']                                // CHANGE TO YOUR DOMAIN (list for SANS)
  , email: 'user@email.com'                                 // CHANGE TO YOUR EMAIL
  , agreeTos: ''                                            // set to tosUrl string (or true) to pre-approve (and skip agreeToTerms)
  , rsaKeySize: 2048                                        // 2048 or higher
  , challengeType: 'http-01'                                // http-01, tls-sni-01, or dns-01

  }).then(function (results) {

    console.log('success');

  }, function (err) {

    // Note: you must either use le.middleware() with express,
    // manually use le.challenges['http-01'].get(opts, domain, key, val, done)
    // or have a webserver running and responding
    // to /.well-known/acme-challenge at `webrootPath`
    console.error('[Error]: autohttps/examples/standalone');
    console.error(err.stack);

  });

});
```

Here's what `results` looks like:

```javascript
{ privkey: ''     // PEM encoded private key
, cert: ''        // PEM encoded cert
, chain: ''       // PEM encoded intermediate cert
, issuedAt: 0     // notBefore date (in ms) parsed from cert
, expiresAt: 0    // notAfter date (in ms) parsed from cert
, subject: ''     // example.com
, altnames: []    // example.com,www.example.com
}
```

API
---

The full end-user API is exposed in the example above and includes all relevant options.

```
le.register(opts)
le.check(opts)
```

### Helper Functions

We do expose a few helper functions:

* LE.validDomain(hostname) // returns '' or the hostname string if it's a valid ascii or punycode domain name

TODO fetch domain tld list

### Template Strings

The following variables will be tempalted in any strings passed to the options object:

* `~/` replaced with `os.homedir()` i.e. `/Users/aj`
* `:hostname` replaced with the first domain in the list i.e. `example.com`
