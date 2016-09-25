'use strict';

var url = require('url');


var Datasets = require('./DatasetsService');

module.exports.find = function find (req, res, next) {
  Datasets.find(req.swagger.params, res, next);
};

module.exports.getByID = function getByID (req, res, next) {
  Datasets.getByID(req.swagger.params, res, next);
};

module.exports.getByIDOperation = function getByIDOperation (req, res, next) {
  Datasets.getByIDOperation(req.swagger.params, res, next);
};

module.exports.set = function set (req, res, next) {
  Datasets.set(req.swagger.params, res, next);
};
