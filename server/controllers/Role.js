'use strict';

let Role = require('./RoleService');

module.exports.list = function list (req, res, next) {
  Role.list(req.swagger.params, res, next);
};

module.exports.getRole = function (req, res, next) {
  Role.getRole(req.swagger.params, res, next);
};

module.exports.setRole = function (req, res, next) {
  Role.updateRole(req.swagger.params, res, next);
};

module.exports.createRole = function (req, res, next) {
  Role.createRole(req.swagger.params, res, next);
};

module.exports.deleteRole = function (req, res, next) {
  Role.deleteRole(req.swagger.params, res, next);
};
