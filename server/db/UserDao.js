'use strict';

let dbInterface = require('./dbInterface');

class UserDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  hasAdminUser() {
    return this.client.findInTable('users', {roles: -1})
      .then(function (data) {

        // there's at least one admin user
        return data.length > 0;

      }, function (err) {

        // if table could not be found then there also cannot be an admin user
        return false;

      });
  }

  getUsers() {
    return this.client.searchFor('users', "");
  }


  /**
   *
   * @param user
   * @returns {*}
   */
  updateUser(user) {
    return this.client.updateIntoTable('users', user.login, user);
  }

  /**
   * Find a user with a given login.
   * @param {string} login
   * @returns {*}
   */
  findUser(login) {
    return this.client.getDocById('users', login);
  }

  deleteUser(login) {
    return this.client.deleteById('users', login);
  }

  /**
   *
   * @param login
   * @param password
   * @param firstName
   * @param lastName
   * @param {number[]} roles
   * @returns {*}
   */
  createUser(login, password, firstName, lastName, roles) {
    // let mappedRoles = roles.map(role => this.client.getObjectId(role));

    return this.client.insertIntoTable('users', {
      _id: login,
      login: login,
      password: password,
      firstName: firstName,
      lastName: lastName,
      roles: roles
    });
  }

}

module.exports = new UserDao();