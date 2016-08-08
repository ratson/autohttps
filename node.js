/*!
 * letiny-core
 * Copyright(c) 2015 AJ ONeal <aj@daplie.com> https://daplie.com
 * Apache-2.0 OR MIT (and hence also MPL 2.0)
*/
'use strict';

var defaults = {
  productionServerUrl:    "https://acme-v01.api.letsencrypt.org/directory"
, stagingServerUrl:       "https://acme-staging.api.letsencrypt.org/directory"
, acmeChallengePrefix:    "/.well-known/acme-challenge/"
, knownEndpoints:         [ 'new-authz', 'new-cert', 'new-reg', 'revoke-cert' ]
};

function create(deps) {
  deps = deps || {};
  deps.LeCore = {};

  Object.keys(defaults).forEach(function (key) {
    deps[key] = defaults[key];
    deps.LeCore[key] = defaults[key];
  });

  deps.RSA = deps.RSA || require('rsa-compat').RSA;
  deps.request = deps.request || require('request');

  deps.LeCore.Acme = require('./lib/acme-client').create(deps);
  deps.LeCore.getAcmeUrls = require('./lib/get-acme-urls').create(deps);
  deps.LeCore.registerNewAccount = require('./lib/register-new-account').create(deps);
  deps.LeCore.getCertificate = require('./lib/get-certificate').create(deps);
  deps.LeCore.getOptions = function () {
    var defs = {};

    Object.keys(defaults).forEach(function (key) {
      defs[key] = defs[deps] || defaults[key];
    });

    return defs;
  };

  deps.Acme = deps.LeCore.Acme;

  return deps.LeCore;
}

// TODO make this the official usage
module.exports.ACME = { create: create };
