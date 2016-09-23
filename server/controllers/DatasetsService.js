'use strict';
var db = require('../db/dbInterface');

exports.getByID = function(args, res, next) {
  /**
   * parameters expected in the args:
  * id (String)
  * publish (Boolean)
  **/

  var id = args.id.value;
  db.getDocument(id).then(function (doc) {
    console.log('FOUND', doc);
    res.setHeader('Content-Type', 'application/json');
    // res.status(200).json(dataset);
    res.end(JSON.stringify(doc, null, 2))

  }, function (err) {
    console.error('not found:', err);
    res.end();

  });
}

exports.set = function(args, res, next) {
  /**
   * parameters expected in the args:
   * id (String)
   * data (Dataset)
   * publish (Boolean)
   **/

  var id = args.id.value;
  var doc = args.data.value;
  db.updateDocument(doc).then(function (result) {
    console.log('Inserted doc', result);
    res.end(JSON.stringify({_id: result}, null, 2))
  }).catch(function (err) {
    console.error('Error during db operation:', err);
    // no response value expected for this operation
    res.end();
  });
}

