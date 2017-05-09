'use strict';

let User = require('./UserService'),
  Jwt = require('jsonwebtoken'),
  Config = require('../config');

module.exports.login = function find (req, res, next) {
  User.login(req.swagger.params, res, next);
};

module.exports.refreshToken = function (req, res, next) {
  let token = req.headers.authorization.substring(Config.key.headerPrefix.length);
  let decoded = Jwt.decode(token);
  User.refreshToken(req.swagger.params, res, decoded.login, next);
};

module.exports.list = function list (req, res, next) {
  User.list(req.swagger.params, res, next);
};

module.exports.getUser = function getUser (req, res, next) {
  User.getUser(req.swagger.params, res, next);
};

module.exports.setUser = function setUser (req, res, next) {
  User.updateUser(req.swagger.params, res, next);
};

module.exports.createUser = function (req, res, next) {
  User.createUser(req.swagger.params, res, next);
};

module.exports.deleteUser = function (req, res, next) {
  User.deleteUser(req.swagger.params, res, next);
};
