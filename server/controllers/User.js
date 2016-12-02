

var User = require('./UserService');

module.exports.login = function find (req, res, next) {
  User.login(req.swagger.params, res, next);
};

module.exports.list = function list (req, res, next) {
  User.list(req.swagger.params, res, next);
};