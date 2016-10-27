

var User = require('./UserService');

module.exports.login = function find (req, res, next) {
  User.login(req.swagger.params, res, next);
};