'use strict';

let Config = require('../config'),
  Jwt = require('jsonwebtoken'),
  db = require('../db/UserDao'),
  bcrypt = require('bcryptjs');

class UserService {

  login(args, res) {

    let username = args.username.value;
    let password = args.password.value;

    db.findUser(username).then(function (user) {
      console.log('user:', user);
      if (user === null || !bcrypt.compareSync(password, user.password)) {

        throw new Error('User not found or wrong password');

      } else {
        let tokenData = {
          username: 'username',
          role: user.role
        };
        let result = {
          username: user.login,
          role: user.role,
          token: Jwt.sign(tokenData, Config.key.privateKey, {expiresIn: Config.key.tokenExpiry})
        };
        res.end(JSON.stringify(result, null, 2));
      }

    }).catch(function (err) {
      res.statusCode = 403;
      res.end(err.message);

    });

  }

  list(args, res) {
    db.getUsers().then(function (user) {
      res.end(JSON.stringify(user, null, 2));

    }).catch(function (err) {
      res.statusCode = 403;
      res.end(err.message);

    });
  };

  getUser(args, res, next) {
    let login = args.id.value;

    db.findUser(login).then(function (user) {
      // remove password
      delete user.password;

      // send back to client
      res.end(JSON.stringify(user, null, 2));

    }).catch(function (err) {
      res.statusCode = 404;
      res.end(err.message);
    });
  }

  setUser(args, res) {
    let login = args.id.value;
    let data = args.data.value;

    debugger;
    db.findUser(login).then(user => {
      // if user exists
      db.setUser(data).then(user => {
        res.end();

      }).catch(function (err) {
        res.statusCode = 500;
        res.end(err.message);
      });

    }, () => {

      // if user does not exist
      db.createUser(data.login, data.login, data.firstName, data.lastName).then(()=> {
        res.end();
      }).catch(function (err) {
        res.statusCode = 500;
        res.end(err.message);
      });
    });
  }

}

module.exports = new UserService();