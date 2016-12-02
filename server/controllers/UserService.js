var Config = require('../config');
var Jwt = require('jsonwebtoken');
var db = require('../db/dbInterface');

exports.login = function (args, res, next) {

  var body = args.logindata.value;
  var username = body.username;
  var password = body.password;

  console.log('login');
  db.findUser(username).then(function (user) {
    console.log('user:', user);
    if (user === null) throw new Error('User not found');

    if (user.password === password) {

      var tokenData = {
        username: 'username',
        role: user.role
      };
      var result = {
        username: 'andre',
        token: Jwt.sign(tokenData, Config.key.privateKey, { expiresIn: Config.key.tokenExpiry })
      };
      res.end(JSON.stringify(result, null, 2));

    } else {

      res.statusCode = 401;
      res.end('User not known');

    }
  }).catch(function (err) {
    res.end(err.message);

  });

  // User.findUser(req.body.username, function(err, user) {
  //   if (!err) {
  //     console.log(user);
  //     if (user === null){
  //       return res.send(Boom.forbidden("invalid username or password"));
  //     }
  //     if (req.body.password === Common.decrypt(user.password)) {
  //       if(!user.isVerified){
  //         return res.send(Boom.forbidden("Your email address is not verified. please verify your email address to proceed"));
  //       }
  //       else{
  //         var tokenData = {
  //           username: user.username,
  //           id: user._id
  //         };
  //         var result = {
  //           username: user.username,
  //           token: Jwt.sign(tokenData, privateKey)
  //         };
  //
  //         return res.json(result);
  //       }
  //     } else{
  //       return res.send(Boom.forbidden("invalid username or password"));
  //     }
  //   } else {
  //     if (11000 === err.code || 11001 === err.code) {
  //       return res.send(Boom.forbidden("please provide another user email"));
  //     } else {
  //       console.error(err);
  //       return res.send(Boom.badImplementation(err));
  //     }
  //   }
  // })
};

