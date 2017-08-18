'use strict';

let dbInterface = require('./dbInterface');

class BehaviourDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  getBehaviours() {
    return this.client.findInTable('behaviours', {});
  };

  setBehaviour(behaviour) {
    // return this.client.updateIntoTable('behaviours', behaviour._id, behaviour);//, {upsert: true});
    return this.client.insertIntoTable('behaviours', behaviour, behaviour._id);//, {upsert: true});
  };

}

module.exports = new BehaviourDao();
