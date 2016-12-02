'use strict';

var url = require('url');


var Behaviours = require('./BehavioursService');

module.exports.optionsBehaviours = function options (req, res, next) {
  Behaviours.options(req.swagger.params, res, next);
};

module.exports.get = function get (req, res, next) {
  Behaviours.get(req.swagger.params, res, next);
};

module.exports.setBehaviours = function set (req, res, next) {
  Behaviours.set(req.swagger.params, res, next);
};
