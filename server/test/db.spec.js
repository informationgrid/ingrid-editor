/**
 * Created by andre on 02.12.2016.
 */
const db = require('../db/dbInterface');

describe('Database', function () {

  beforeEach(function () {
  });

  xit('should return true if an admin user was found', function () {
    db.hasAdminUser().then(function(result) {
      expect(result).toBe(false);
    });
  });
});
