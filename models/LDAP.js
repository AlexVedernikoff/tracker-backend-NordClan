'use strict';

var ldapjs = require('ldapjs');

var config = require('../configs');
var HttpError = require('./HttpError');
var User = require('./User');

class LDAP {
  constructor(options) {
    this.req = {};

    if (options.req) {
      this.req = options.req;
      delete options.req;
    }

    this.options = options;
  }

  setReq(req) { this.req = req; return this; }

  connect() {
    if (this.connecting) {
      return this.connecting;
    }

    this.ldapClient = ldapjs.createClient({
      url: this.generateLdapUrl(config.ldap)
    });

    this.connecting = new Promise((resolve, reject) => {
      var checkConnect = () => {
        if (this.ldapClient.connected) {
          return resolve();
        }

        setImmediate(checkConnect);
      };

      checkConnect();

      this.ldapClient.on('error', reject);

    })
      .then(() => (this.connected = true))
      .catch((err) => {
        throw new HttpError(500, 'Error on LDAP server:' + err.message, err);
      });

    return this.connecting;
  }

  login() {
    var opts = {
      filter: '(uid=' + this.req.fields.username + ')',
      scope: 'sub',
      attributes: []
    };

    return this.connect()
      .then(() => this.bindP(['cn=' + config.ldap.username + ',dc=' + config.ldap.domain, config.ldap.password]))
      .then(() => this.searchP([config.ldap.dn, opts]))
      .then(entry => this.bindP(['cn=' + entry.object.cn + ',' + config.ldap.dn, this.req.fields.password])
        .then(() => {
          let obj = {};
          entry.attributes.map(a => obj[a.type] = (a.vals.length > 1 ? a.vals : a.vals[0]));

          delete obj.userPassword;
          delete obj.objectClass;

          return obj;
        }));
  }

  auth() {
    var userData = {};
    var token = this.req.get('Authorization');

    if (token) {
      credentials = new Buffer(token.replace(/basic /i, ''), 'base64').toString().split(':');
      userData.username = credentials[0];
      userData.password = credentials[1];
    } else {
      if (this.req.query && this.req.query.username) {
        userData = this.req.query;
      }

      if (this.req.fields && this.req.fields.username) {
        userData = this.req.fields;
      }
    }
  }

  logout() {
    return Promise.resolve();
  }

  generateLdapUrl(data) {
    return 'ldap://' + data.host + ':' + data.port + '/dc=' + data.domain;
  }

  bindP(params) {
    return new Promise((resolve, reject) => {
      this.ldapClient.bind(params[0], params[1], (err) => {
        if (err) {
          this.ldapClient.unbind();

          return reject(err);
        }

        resolve();
      });
    });
  }

  searchP(params) {
    return new Promise((resolve, reject) => {
      this.ldapClient.search(params[0], params[1], (err, search) => {
        if (err) { return reject(err); }

        var found = false;

        search.on('end', (result) => {
          if (!found) { reject(new HttpError(404, 'User not found')); }
        });

        search.on('searchEntry', (entry) => {
          found = true;

          resolve(entry);
        });
      });
    });
  }
}

module.exports = LDAP;
