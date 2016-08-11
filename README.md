le-sni-auto
===========

**DRAFT** this is not yet published to npm

An auto-sni strategy for registering and renewing letsencrypt certificates using SNICallback.

This does a couple of rather simple things:

  * caches certificates in memory
  * calls `getCertificatesAsync(domain, null)` when a certificate is not in memory
  * calls `getCertificatesASync(domain, certs)` when a certificate is up for renewal or expired

Install
=======

```bash
npm install --save le-sni-auto@2.x
```

Usage
=====

With node-letsencrypt
---------------------

```javascript
'use strict';



var leSni = require('le-sni-auto').create({

  notBefore: 10 * 24 * 60 * 60 1000       // do not renew more than 10 days before expiration
, notAfter: 5 * 24 * 60 * 60 1000         // do not wait more than 5 days before expiration

, httpsOptions: {
    rejectUnauthorized: true              // These options will be used with tls.createSecureContext()
  , requestCert: false                    // in addition to key (privkey.pem) and cert (cert.pem + chain.pem),
  , ca: null                              // which are provided by letsencrypt
  , crl: null
  }

});



var le = require('letsencrypt').create({
  server: 'staging'

, sni: leSni

, approveDomains: function (domain, cb) {
    // here you would lookup details such as email address in your db
    cb(null, { email: 'john.doe@gmail.com.', domains: [domain, 'www.' + domain], agreeTos: true }}
  }
});



var app = require('express')();
var httpsOptions = { SNICallback: le.sni.callback };

httpsOptions = require('localhost.daplie.com-certificates').merge(httpsOptions);


http.createServer(le.handleAcmeOrRedirectToHttps());
https.createServer(dummyCerts, le.handleAcmeOrUse(app)).listen(443);
```

You can also provide a thunk-style `getCertificates(domain, certs, cb)`.

Standalone
----------

```javascript
'use strict';


var le = require('letsencrypt').create({
  notBefore: 10 * 24 * 60 * 60 1000       // do not renew prior to 10 days before expiration
, notAfter: 5 * 24 * 60 * 60 1000         // do not wait more than 5 days before expiration

  // key (privkey.pem) and cert (cert.pem + chain.pem) will be provided by letsencrypt
, httpsOptions: { rejectUnauthorized: true, requestCert: false, ca: null, crl: null }

, getCertificatesAsync: function (domain, certs) {
    // return a promise with an object with the following keys:
    // { privkey, cert, chain, expiresAt, issuedAt, subject, altnames }
  }
});




var dummyCerts = require('localhost.daplie.com-certificates');
dummyCerts.SNICallback = le.sni.sniCallback;

https.createServer(dummyCerts, );
```

You can also provide a thunk-style `getCertificates(domain, certs, cb)`.
