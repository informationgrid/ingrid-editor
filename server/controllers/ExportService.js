'use strict';

let Config = require('../config'),
  Jwt = require('jsonwebtoken');

class ExportService {

  exportDataset(args, res) {

    res.statusCode = 501;
    res.end('Please implement!');
  }
}

module.exports = new ExportService();