'use strict';

let mongoClient = require('./db-mongo');

/**
 *
 * @returns {*}
 */
let getClient = function() {
  return mongoClient;
};

let connect = function () {
  // Use connect method to connect to the server
  return mongoClient.connect();
};

let closeDB = function () {
  mongoClient.close();
};

/**
 *
 */
let updateFullIndexSearch = function () {
  // TODO: update full index search
  mongoClient.updateIndexForSearch('documents');
};

module.exports = {
  connect: connect,
  closeDB: closeDB,

  updateFullIndexSearch: updateFullIndexSearch,

  getClient: getClient
};