'use strict';

let Config = require('../config'),
  Jwt = require('jsonwebtoken'),
  db = require('../db/StatisticDao');

class ImportService {

  importDataset(args, res) {

    res.statusCode = 501;
    res.end('Please implement!');
  }
}

module.exports = new ImportService();