'use strict';
let log = require('log4js').getLogger();
let db = require('../db/DatasetDao');
let dbInterface = require('../db/dbInterface');
let validator = require('../validation/validator');
let exportService = require('../export/export');

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

exports.find = function (args, res) {
  /**
   * parameters expected in the args:
   * query (String)
   **/
  let query = args.query.value;
  let requestChildren = args.children.value;
  let parentId = args.parentId.value;
  let fields = args.fields.value.split(',');
  let sort = args.sort.value;
  let reverse = args.reverse.value;

  if (requestChildren === true) {
    // convert empty id to null object for requesting root datasets
    if (parentId === undefined) parentId = null;

    db.getChildDocuments(parentId).then(function (docs) {
      // TODO: only return requested fields instead of whole documents as in findDocuments
      let result = extractFields(docs, fields);
      res.end(JSON.stringify(result, null, 2));
    }, (err) => {
      log.error('error:', err);
      res.statusCode = 500;
      res.end(err.message);
    });

  } else {

    db.findDocuments(query, sort, reverse).then((docs) => {
      // console.log('FOUND', docs.length);
      let result = extractFields(docs, fields);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result, null, 2))

    }, (err) => {
      log.error('nothing found:', err);
      res.statusCode = 404;
      res.end(err.message);
    });
  }
};

exports.getByID = function (args, res) {
  /**
   * parameters expected in the args:
   * id (String)
   * publish (Boolean)
   **/

  let id = args.id.value;
  let publishedVersion = args.publish.value;

  db.getDocument(id, publishedVersion).then(function (doc) {
    // console.log('FOUND', doc);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(doc, null, 2))

  }, function (err) {
    log.error('not found:', err);
    res.statusCode = 404;
    res.end(err.message);
  });
};

exports.create = function (args, res, userId) {
  /**
   * parameters expected in the args:
   * data (Dataset)
   * publish (Boolean)
   **/
  log.debug('Store dataset');

  let doc = args.data.value;
  let docId = doc._id;
  let publishedVersion = args.publish.value;

  let parent = doc._parent;

  let storeDoc = () => {
    db.updateDocument(doc, publishedVersion, userId).then(function (result) {
      // notify parent that it has a child
      // but only if it's a new child
      if (!docId) db.setChildInfoTo(parent);

      // update search index
      dbInterface.updateFullIndexSearch();
      log.debug('Inserted doc', parent);
      res.end(JSON.stringify(result, null, 2))
    }).catch(function (err) {
      log.error('Error during db operation:', err.stack);
      // no response value expected for this operation
      res.statusCode = 404;
      res.end(err.message);
    });
  };

  // TODO: add backend validation here when publishing a document
  // we want to have controlled validation where some can be turned of
  // depending on the settings of the behaviours
  // store document in database
  if (publishedVersion) {
    validator.run(doc).then((info) => {
      log.debug('Validation is ok', info);
      storeDoc();
    }).catch((errors) => {
      log.error('Error during validation document', errors);
      res.statusCode = 400;
      res.end(JSON.stringify(errors, null, 2));
    });
  } else {
    storeDoc();
  }

};

exports.update = function (args, res, userId) {
  /**
   * parameters expected in the args:
   * id (String)
   * data (Dataset)
   * publish (Boolean)
   * revert (Boolean)
   **/
  log.debug('Store dataset');

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
      log.error('Error during revert operation:', err);
      // no response value expected for this operation
      res.statusCode = 500;
      res.end(err.message);
    });
  } else {

    let storeDoc = () => {
      db.updateDocument(doc, publishedVersion, userId).then(function (result) {
        // notify parent that it has a child
        // but only if it's a new child
        if (!docId) db.setChildInfoTo(parent);

        // update search index
        dbInterface.updateFullIndexSearch();
        log.debug('Inserted doc', parent);
        res.end(JSON.stringify(result, null, 2))
      }).catch(function (err) {
        log.error('Error during db operation:', err.stack);
        // no response value expected for this operation
        res.statusCode = 404;
        res.end(err.message);
      });
    };

    // TODO: add backend validation here when publishing a document
    // we want to have controlled validation where some can be turned of
    // depending on the settings of the behaviours
    // store document in database
    if (publishedVersion) {
      validator.run(doc).then((info) => {
        log.debug('Validation is ok', info);
        storeDoc();
      }).catch((errors) => {
        log.error('Error during validation document', errors);
        res.statusCode = 400;
        res.end(JSON.stringify(errors, null, 2));
      });
    } else {
      storeDoc();
    }

  }
};

exports.deleteById = function (args, res) {
  let ids = args.id.value.split(',');

  ids.forEach(id => {

    // get the path to the dataset to find out the parent dataset
    db.getPathToDataset(id).then((path) => {
      // delete the dataset
      db.deleteDocument(id).then(() => {

        // also delete child info if it was the last child
        db.checkForChildren(path[path.length - 2]);

        res.end();
      }, function (err) {
        log.error('Error during db operation:', err.stack);
        res.statusCode = 500;
        res.end(err.message);
      });
    });

  })

};

exports.getPath = function (args, res) {
  let id = args.id.value;

  db.getPathToDataset(id).then(function (result) {

    log.debug("path:", result);
    res.end(JSON.stringify(result, null, 2))
  }).catch(function (err) {
    log.error('Error during db operation:', err.stack);
    // no response value expected for this operation
    res.statusCode = 500;
    res.end(err.message);
  });
};

exports.copy = function (args, res) {
  let /*string[]*/ids = args.ids.value;

  res.statusCode = 500;
  res.end("not implemented");
};

exports.move = function (args, res) {
  let /*string[]*/ids = args.ids.value;

  res.statusCode = 500;
  res.end("not implemented");

};

exports.export = function (args, res) {
  let /*string*/id = args.id.value;
  let /*string*/format = args.format.value;


  db.getDocument(id, false).then(function (doc) {
    let exportedDoc = exportService.exportToFormat(format, doc);
    res.setHeader('Content-Type', 'application/json');
    res.end(exportedDoc.end({pretty: true}) + '');

  }, function (err) {
    log.error('not found:', err);
    res.statusCode = 404;
    res.end(err.message);
  });
};
