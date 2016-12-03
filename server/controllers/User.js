'use strict';

let User = require('./UserService');

module.exports.login = function find (req, res, next) {
  User.login(req.swagger.params, res, next);
};

module.exports.list = function list (req, res, next) {
  User.list(req.swagger.params, res, next);
};

module.exports.getUser = function getUser (req, res, next) {
  User.getUser(req.swagger.params, res, next);
};

module.exports.setUser = function setUser (req, res, next) {
  User.setUser(req.swagger.params, res, next);
};
