'use strict';
var async = require('async');
var mongo = require('mongoose');
var userSync = require('./sync');
var statusUpgrader = require('./dicts/statuses');
var connection;

async.series([
  opendb,
  userSync,
  statusUpgrader,
  closedb
  ],
  (err) => {
    if (err) {
      throw new Error(err);
    }
    console.log('Upgrade completed.');
  }
);

function opendb(callback) {
  mongo.connect('mongodb://localhost/estimate-me');
  connection = mongo.connection;
  connection.on('open', callback);
}

function closedb(callback) {
  mongo.disconnect(callback);
}
