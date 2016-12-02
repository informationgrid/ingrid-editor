'use strict';

var url = require('url');


var Datasets = require('./DatasetsService');

module.exports.options = function find (req, res, next) {
  Datasets.options(req.swagger.params, res, next);
};
module.exports.optionsChildren = function optionsChildren (req, res, next) {
  Datasets.optionsChildren(req.swagger.params, res, next);
};

module.exports.find = function find (req, res, next) {
  Datasets.find(req.swagger.params, res, next);
};

module.exports.children = function find (req, res, next) {
  Datasets.children(req.swagger.params, res, next);
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

module.exports.deleteById = function deleteById (req, res, next) {
  Datasets.deleteById(req.swagger.params, res, next);
};

module.exports.getPath = function getPath (req, res, next) {
  Datasets.getPath(req.swagger.params, res, next);
};
