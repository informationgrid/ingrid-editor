'use strict';
let db = require('../db/DatasetDao');
let dbInterface = require('../db/dbInterface');

/**
 *
 * @param docs
 * @param {Object[]} fields
 * @returns {Array}
 */
let extractFields = function (docs, fields) {
  let result = [];
  docs.forEach(function (doc) {
    // get all requested fields from the docs to satisfy the client for whatever
    // it will do with the result
    let obj = {
      hasChildren: doc.hasChildren
    };

    fields.forEach(function (field) {
      let subFields = field.split('.');
      let value = null;
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

exports.find = function(args, res) {
  /**
   * parameters expected in the args:
   * query (String)
   **/
  let query = args.query.value;
  let fields = args.fields.value.split(',');
  let sort = args.sort.value;
  let reverse = args.reverse.value;

  db.findDocuments(query, sort, reverse).then((docs) => {
    console.log('FOUND', docs.length);
    let result = extractFields(docs, fields);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result, null, 2))

  }, (err) => {
    console.error('nothing found:', err);
    res.statusCode = 404;
    res.end(err.message);
  });
};

exports.children = function(args, res) {
  let id = args.parentId.value;
  let fields = args.fields.value.split(',');

  // convert empty id to null object for requesting root datasets
  if (id === undefined) id = null;

  db.getChildDocuments(id).then(function (docs) {
    // TODO: only return requested fields instead of whole documents as in findDocuments
    let result = extractFields(docs, fields);
    res.end(JSON.stringify(result, null, 2));
  }, (err) => {
    console.error('error:', err);
    res.statusCode = 500;
    res.end(err.message);
  });

};

exports.getByID = function(args, res) {
  /**
   * parameters expected in the args:
   * id (String)
   * publish (Boolean)
   **/

  let id = args.id.value;
  let publishedVersion = args.publish.value;

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

exports.getByIDOperation = function(args, res) {
  /**
   * parameters expected in the args:
   * id (String)
   * publish (Boolean)
   **/
  // no response value expected for this operation
  res.end();
};

exports.set = function(args, res, userId) {
  /**
   * parameters expected in the args:
   * id (String)
   * data (Dataset)
   * publish (Boolean)
   * revert (Boolean)
   **/
  console.log('Store dataset');

  let id = args.id.value;
  let doc = args.data.value;
  let docId = doc._id;
  let publishedVersion = args.publish.value;
  let revert = args.revert ? args.revert.value : false;

  let parent = doc._parent;

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

    db.updateDocument(doc, publishedVersion, userId).then(function (result) {
      // notify parent that it has a child
      // but only if it's a new child
      if (!docId) db.setChildInfoTo(parent);

      // update search index
      dbInterface.updateFullIndexSearch();
      console.log('Inserted doc', parent);
      res.end(JSON.stringify(result, null, 2))
    }).catch(function (err) {
      console.error('Error during db operation:', err.stack);
      // no response value expected for this operation
      res.statusCode = 404;
      res.end(err.message);
    });
  }
};

exports.deleteById = function (args, res) {
  let id = args.id.value;

  // get the path to the dataset to find out the parent dataset
  db.getPathToDataset(id).then((path) => {
    // delete the dataset
    db.deleteDocument(id).then(() => {

      // also delete child info if it was the last child
      db.checkForChildren(path[path.length - 2]);

      res.end();
    }, function (err) {
      console.error('Error during db operation:', err.stack);
      res.statusCode = 500;
      res.end(err.message);
    });
  });

};

exports.getPath = function(args, res) {
  let id = args.id.value;

  db.getPathToDataset(id).then(function (result) {

    console.log("path:", result);
    res.end(JSON.stringify(result, null, 2))
  }).catch(function (err) {
    console.error('Error during db operation:', err.stack);
    // no response value expected for this operation
    res.statusCode = 500;
    res.end(err.message);
  });
};