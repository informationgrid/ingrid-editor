'use strict';

let Export = require('./ExportService');

module.exports.exportDataset = function (req, res, next) {
  Export.exportDataset(req.swagger.params, res, next);
};
