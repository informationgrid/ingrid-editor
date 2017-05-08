'use strict';

let Statistic = require('./StatisticService');

module.exports.getStatistic = function (req, res, next) {
  Statistic.get(req.swagger.params, res, next);
};
