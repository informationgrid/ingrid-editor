'use strict';

let dbInterface = require('./dbInterface');

class RoleDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  getRoles() {
    return this.client.searchFor('role', "");
  }


  /**
   *
   * @param user
   * @returns {*}
   */
  updateRole(role) {
    return this.client.updateIntoTable('role', role.id, role);
  }

  /**
   * Find a user with a given login.
   * @param {string} name of the role
   * @returns {*}
   */
  findRole(name) {
    return this.client.findInTable('role', {name: name})
      .then(roles => roles[0]);
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
