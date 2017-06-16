'use strict';

let Jwt = require('jsonwebtoken'),
  Datasets = require('./DatasetsService'),
  Config = require('../config');

module.exports.find = function find (req, res, next) {
  Datasets.find(req.swagger.params, res, next);
};

module.exports.getByID = function getByID (req, res, next) {
  Datasets.getByID(req.swagger.params, res, next);
};

module.exports.createDataset = function set (req, res, next) {
  let token = req.headers.authorization.substring(Config.key.headerPrefix.length);
  let decoded = Jwt.decode(token);
  Datasets.create(req.swagger.params, res, decoded.login, next);
};

module.exports.updateDataset = function set (req, res, next) {
  let token = req.headers.authorization.substring(Config.key.headerPrefix.length);
  let decoded = Jwt.decode(token);
  Datasets.update(req.swagger.params, res, decoded.login, next);
};

module.exports.deleteById = function deleteById (req, res, next) {
  Datasets.deleteById(req.swagger.params, res, next);
};

module.exports.getPath = function getPath (req, res, next) {
  Datasets.getPath(req.swagger.params, res, next);
};

module.exports.copyDatasets = function(req, res, next) {
  Datasets.copy(req.swagger.params, res, next);
};

module.exports.moveDatasets = function(req, res, next) {
  Datasets.move(req.swagger.params, res, next);
};

module.exports.exportDataset = function(req, res, next) {
  Datasets.export(req.swagger.params, res, next);
};
