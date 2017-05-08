'use strict';

let Config = require('../config'),
  Jwt = require('jsonwebtoken'),
  db = require('../db/StatisticDao');

class StatisticService {

  get(args, res) {
    db.getDocStatistic().then(function (stat) {
      res.end(JSON.stringify(stat, null, 2));

    }).catch(function (err) {
      res.statusCode = 500;
      res.end(err.message);

    });
  };
}

module.exports = new StatisticService();