'use strict';

let dbInterface = require('./dbInterface');

class UserDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  hasAdminUser() {
    return this.client.findInTable('users', {role: -1})
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
  setUser(user) {
    return this.client.insertIntoTable('users', user);
  }

  /**
   * Find a user with a given login.
   * @param {string} login
   * @returns {*}
   */
  findUser(login) {
    return this.client.getDocById('users', login);
  }


  createUser(login, password, firstName, lastName, role) {
    this.client.insertIntoTable('users', {
      _id: login,
      login: login,
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: role
    });
  }

}

module.exports = new UserDao();