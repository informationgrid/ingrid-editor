'use strict';

// let client = require('./db-mongo');
// let client = require('./db-tingo');
let client = require('./db-postgres');

/**
 *
 * @returns {*}
 */
let getClient = function() {
  return client;
};

let connect = function () {
  // Use connect method to connect to the server
  return client.connect();
};

let closeDB = function () {
  client.close();
};

/**
 *
 */
let updateFullIndexSearch = function () {
  // TODO: update full index search
  client.updateIndexForSearch('documents');
};

module.exports = {
  connect: connect,
  closeDB: closeDB,

  updateFullIndexSearch: updateFullIndexSearch,

  getClient: getClient
};
