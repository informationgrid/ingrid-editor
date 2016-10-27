'use strict';
var db = require('../db/dbInterface');

/**
 *
 * @param docs
 * @param {Object[]} fields
 * @returns {Array}
 */
var extractFields = function (docs, fields) {
  var result = [];
  docs.forEach(function (doc) {
    // get all requested fields from the docs to satisfy the client for whatever
    // it will do with the result
    var obj = {
      hasChildren: doc.hasChildren
    };

    fields.forEach(function (field) {
      var subFields = field.split('.');
      var value = null;
      if (subFields.length > 1) {
        value = doc;
        subFields.forEach(function (sub) {
          if (value === undefined) {
            return;
          }
          value = value[sub];
        });
      } else {
        value = doc ? doc[field] : undefined;
      }

      if (value !== undefined) {
        obj[field] = value;
      }
    });
    result.push(obj);
  });
  return result;
};

exports.find = function(args, res, next) {
  /**
   * parameters expected in the args:
   * query (String)
   **/
  var query = args.query.value;
  var fields = args.fields.value.split(',');
  db.findDocuments(query).then(function (docs) {
    console.log('FOUND', docs.length);
    var result = extractFields(docs, fields);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result, null, 2))

  }, function (err) {
    console.error('nothing found:', err);
    res.statusCode = 404;
    res.end(err.message);
  });
};

exports.children = function(args, res, next) {
  var id = args.parentId.value;
  var fields = args.fields.value.split(',');

  // convert empty id to null object for requesting root datasets
  if (id === undefined) id = null;

  db.getChildDocuments(id).then(function (docs) {
    // TODO: only return requested fields instead of whole documents as in findDocuments
    var result = extractFields(docs, fields);
    res.end(JSON.stringify(result, null, 2));
  });

};

exports.getByID = function(args, res, next) {
  /**
   * parameters expected in the args:
   * id (String)
   * publish (Boolean)
   **/

  var id = args.id.value;
  var publishedVersion = args.publish.value;

  db.getDocument(id, publishedVersion).then(function (doc) {
    console.log('FOUND', doc);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(doc, null, 2))

  }, function (err) {
    console.error('not found:', err);
    res.statusCode = 404;
    res.end(err.message);
  });
};

exports.getByIDOperation = function(args, res, next) {
  /**
   * parameters expected in the args:
   * id (String)
   * publish (Boolean)
   **/
  // no response value expected for this operation
  res.end();
};

exports.set = function(args, res, next) {
  /**
   * parameters expected in the args:
   * id (String)
   * data (Dataset)
   * publish (Boolean)
   * revert (Boolean)
   **/
  console.log('Store dataset');

  var id = args.id.value;
  var doc = args.data.value;
  var publishedVersion = args.publish.value;
  var revert = args.revert ? args.revert.value : false;

  var parent = doc._parent;

  if (revert) {
    db.revert(id).then(function (doc) {
      res.end(JSON.stringify(doc, null, 2));
    }).catch(function (err) {
      console.error('Error during revert operation:', err);
      // no response value expected for this operation
      res.statusCode = 500;
      res.end(err.message);
    });
  } else {

    db.updateDocument(doc, publishedVersion).then(function (result) {
      // TODO: notify parent that it has a child?
      db.setChildInfoTo(parent);

      // update search index
      db.updateFullIndexSearch();
      // console.log('Inserted doc', result);
      res.end(JSON.stringify({_id: result}, null, 2))
    }).catch(function (err) {
      console.error('Error during db operation:', err);
      // no response value expected for this operation
      res.statusCode = 404;
      res.end(err.message);
    });
  }
};

exports.deleteById = function (args, res, next) {
  var id = args.id.value;

  db.deleteDocument(id).then(function (result) {
    res.end();
  }, function (err) {
    res.statusCode = 500;
    res.end(err.message);
  });

};