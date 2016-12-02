var Config = require('../config'),
  Jwt = require('jsonwebtoken'),
  db = require('../db/dbInterface'),
  bcrypt = require('bcryptjs');

exports.login = function (args, res, next) {

  var username = args.username.value;
  var password = args.password.value;

  db.findUser(username).then(function (user) {
    console.log('user:', user);
    if (user === null || !bcrypt.compareSync(password, user.password)) {

      throw new Error('User not found or wrong password');

    } else {
      var tokenData = {
        username: 'username',
        role: user.role
      };
      var result = {
        username: user.login,
        role: user.role,
        token: Jwt.sign( tokenData, Config.key.privateKey, {expiresIn: Config.key.tokenExpiry} )
      };
      res.end( JSON.stringify( result, null, 2 ) );
    }

  }).catch(function (err) {
    res.statusCode = 403;
    res.end(err.message);

  });

};

