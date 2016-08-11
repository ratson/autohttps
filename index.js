'use strict';

// autoSni = { notBefore, notAfter, getCertificates, httpsOptions, _dbg_now }
module.exports.create = function (autoSni) {

  var DAY = 24 * 60 * 60 * 1000;
  var MIN = 60 * 1000;
  if (!autoSni.getCertificatesAsync) { autoSni.getCertificatesAsync = require('bluebird').promisify(autoSni.getCertificates); }
  if (!autoSni.notBefore) { throw new Error("must supply options.notBefore (and options.notAfter)"); }
  if (!autoSni.notAfter) { autoSni.notAfter = autoSni.notBefore - (3 * DAY); }
  if (!autoSni.httpsOptions) { autoSni.httpsOptions = {}; }




  //autoSni.renewWithin = autoSni.notBefore;                    // i.e. 15 days
  autoSni.renewWindow = autoSni.notBefore - autoSni.notAfter;      // i.e. 1 day
  //autoSni.renewRatio = autoSni.notBefore = autoSni.renewWindow;  // i.e. 1/15 (6.67%)




  var tls = require('tls');




  var _autoSni = {




    // in-process cache
    _ipc: {}
    // just to account for clock skew
  , _fiveMin: 5 * MIN




    // cache and format incoming certs
  , _cacheCerts: function (certs) {
      var meta = {
        certs: certs
      , tlsContext: 'string' === typeof certs.cert && tls.createSecureContext({
          key: certs.privkey
        , cert: certs.cert + certs.chain
        , rejectUnauthorized: autoSni.httpsOptions.rejectUnauthorized

        , requestCert: autoSni.httpsOptions.requestCert  // request peer verification
        , ca: autoSni.httpsOptions.ca                    // this chain is for incoming peer connctions
        , crl: autoSni.httpsOptions.crl                  // this crl is for incoming peer connections
        }) || { '_fake_tls_context_': true }

      , subject: certs.subject
        // stagger renewal time by a little bit of randomness
      , renewAt: (certs.expiresAt - (autoSni.notBefore - (autoSni.renewWindow * Math.random())))
        // err just barely on the side of safety
      , expiresNear: certs.expiresAt - autoSni._fiveMin
      };
      var link = { subject: certs.subject };

      certs.altnames.forEach(function (domain) {
        autoSni._ipc[domain] = link;
      });
      autoSni._ipc[certs.subject] = meta;

      return meta;
    }




    // automate certificate registration on request
  , sniCallback: function (domain, cb) {
      var certMeta = autoSni._ipc[domain];
      var promise;
      var now = (autoSni._dbg_now || Date.now());

      if (certMeta && certMeta.subject !== domain) {
        //log(autoSni.debug, "LINK CERT", domain);
        certMeta = autoSni._ipc[certMeta.subject];
      }

      if (!certMeta) {
        //log(autoSni.debug, "NO CERT", domain);
        // we don't have a cert and must get one
        promise = autoSni.getCertificatesAsync(domain, null);
      }
      else if (now >= certMeta.expiresNear) {
        //log(autoSni.debug, "EXPIRED CERT");
        // we have a cert, but it's no good for the average user
        promise = autoSni.getCertificatesAsync(domain, certMeta.certs);
      } else {

        // it's time to renew the cert
        if (now >= certMeta.renewAt) {
          //log(autoSni.debug, "RENEWABLE CERT");
          // give the cert some time (2-5 min) to be validated and replaced before trying again
          certMeta.renewAt = (autoSni._dbg_now || Date.now()) + (2 * MIN) + (3 * MIN * Math.random());
          // let the update happen in the background
          autoSni.getCertificatesAsync(domain, certMeta.certs).then(autoSni._cacheCerts);
        }

        // return the valid cert right away
        cb(null, certMeta.tlsContext);
        return;
      }

      // promise the non-existent or expired cert
      promise.then(autoSni._cacheCerts).then(function (certMeta) {
        cb(null, certMeta.tlsContext);
      }, function (err) {
        console.error('ERROR in le-sni-auto:');
        console.error(err.stack || err);
        cb(err);
      });
    }




  };

  Object.keys(_autoSni).forEach(function (key) {
    autoSni[key] = _autoSni[key];
  });
  _autoSni = null;

  return autoSni;
};
