'use strict';

let Import = require('./ImportService');

module.exports.importDataset = function (req, res, next) {
  Import.importDataset(req.swagger.params, res, next);
};
