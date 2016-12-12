'use strict';

let dbInterface = require('./dbInterface');

class RoleDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  getRoles() {
    return this.client.searchFor('roles', "");
  }


  /**
   *
   * @param user
   * @returns {*}
   */
  updateRole(role) {
    return this.client.updateIntoTable('roles', role.id, role);
  }

  /**
   * Find a user with a given login.
   * @param {string} id
   * @returns {*}
   */
  findRole(id) {
    return this.client.getDocById('role', id);
  }

  findRoles(ids) {
    let promises = [];
    ids.forEach(id => {
      promises.push( this.client.getDocById('role', id, true) );
    });
    return Promise.all(promises);
  }

  deleteRole(id) {
    return this.client.deleteById('role', id);
  }

  createRole(id, role) {
    return this.client.insertIntoTable('role', {
      _id: id,
      name: role
    });
  }

}

module.exports = new RoleDao();