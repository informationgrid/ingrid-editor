'use strict';

let dbInterface = require('./dbInterface');

class StatisticDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  getDocStatistic() {
    return this.client.findInTable('documents', {})
      .then(function (data) {


        let result = {};
        data.forEach(entry => {

          let profile = entry.draft ? entry.draft._profile : entry.published._profile;

          if (result[profile] === undefined) {
            result[profile] = 1
          } else {
            result[profile] = result[profile] + 1
          }
        });
        return result;

      }, function (err) {

        // if table could not be found then there also cannot be an admin user
        throw new Error(err);

      });
  }
}

module.exports = new StatisticDao();