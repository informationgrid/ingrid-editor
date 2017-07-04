'use strict';
let log = require('log4js').getLogger();
let Config = require('../config'),
  Jwt = require('jsonwebtoken'),
  db = require('../db/UserDao'),
  dbRole = require('../db/RoleDao'),
  bcrypt = require('bcryptjs');

class UserService {

  login(args, res) {

    let username = args.username.value;
    let password = args.password.value;

    db.findUser(username).then( user => {
      log.debug('user:', user);
      if (user === null || !bcrypt.compareSync(password, user.password)) {

        throw new Error('User not found or wrong password');

      } else {
        delete user.password;

        // map role ids to names
        let usrRoles = user.roles ? user.roles : [];

        UserService.mapIdsToRoles(usrRoles).then( roles => {
          user.roles = roles.map( r => r.name );
          let result = {
            username: user.login,
            roles: roles,
            token: Jwt.sign(user, Config.key.publicKey, {expiresIn: Config.key.tokenExpiry})
          };
          res.end(JSON.stringify(result, null, 2));
        }, err => {
          res.statusCode = 500;
          log.error(err.message);
          res.end(err.message);
        });

      }

    }).catch(function (err) {
      res.statusCode = 403;
      res.end(err.message);

    });

  }

  refreshToken(args, res, decodedToken) {

    let user = {
      login: decodedToken
    };
    let newToken = Jwt.sign(user, Config.key.publicKey, {expiresIn: Config.key.tokenExpiry});
    res.end(JSON.stringify({token: newToken}, null, 2));
  }

  static mapIdsToRoles(roleIds) {
    return dbRole.findRoles(roleIds);
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

  createUser(args, res) {
    let login = args.id.value;
    let data = args.user.value;

    db.findUser(login).then((user) => {

      if (user) {

        res.statusCode = 406;
        res.end("User already exists");

      } else {

        // if user does not exist
        let password = bcrypt.hashSync(data.password, 8);

        db.createUser(data.login, password, data.firstName, data.lastName, data.roles).then(() => {
          res.end();
        }).catch(function (err) {
          res.statusCode = 500;
          res.end(err.message);
        });

      }
    }, () => {

      res.statusCode = 500;
      res.end("Error requesting users: " + error);

    })
  }

  updateUser(args, res) {
    let login = args.id.value;
    let data = args.user.value;

    db.findUser(login).then(user => {

      if (user) {
        log.debug("found user", user);

        // set new password if one was set or use previous password
        if (data.password && data.password.length > 0) {
          data.password = bcrypt.hashSync(data.password, 8);
        } else {
          data.password = user.password;
        }

        // if user exists
        db.updateUser(data).then(user => {
          res.end();

        }).catch(function (err) {
          res.statusCode = 500;
          res.end(err.message);
        });
      } else {

        log.debug("did not find user", login);
        res.statusCode = 406;
        res.end("User does not exists: " + login);

      }

    }, (error) => {

      res.statusCode = 500;
      res.end("Error requesting users: " + error);

    });
  }

  deleteUser(args, res) {
    let login = args.id.value;

    db.deleteUser(login)
      .then(() => res.end())
      .catch(error => {
        res.statusCode = 500;
        res.end("Error deleting user: " + error);
      })
  }
}

module.exports = new UserService();
