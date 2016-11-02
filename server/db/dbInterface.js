var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID,
  assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/ige';
var db = null;

var connect = function (cb) {
  // Use connect method to connect to the server
  MongoClient.connect(url, function (err, dbInstance) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    db = dbInstance;
    if (cb) cb();
  });
};

var closeDB = function () {
  db.close();
};

var _setPublishedState = function (dataset) {
  if (dataset.published && dataset.draft) {
    return "PW";
  } else if (dataset.published) {
    return "P";
  } else {
    return "W";
  }
};

var processResults = function (results) {
  return results.map(function (res) {
    // set the id inside the document
    if (res.draft) {
      res.draft._id = res._id;
      if (res.hasChildren) res.draft.hasChildren = true;
      res.draft._state = _setPublishedState(res);
      return res.draft;
    } else {
      res.published._id = res._id;
      if (res.hasChildren) res.published.hasChildren = true;
      res.published._state = _setPublishedState(res);
      return res.published;
    }
  });
};

var findDocuments = function (query) {
  // Get the documents collection
  var collection = db.collection('documents');


  // Find some documents
  if (query.trim().length > 0) {
    return collection.find({$text: {$search: query}}).toArray().then(processResults);
  } else {
    return collection.find().toArray().then(processResults);
  }
};

var getDocument = function (id, publishedVersion) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  return collection.findOne({'_id': new ObjectID(id)}).then(function (data) {
    if (publishedVersion === true) {
      if (data.published) {
        // only return the published version if it exists

        // add id for the client
        data.published._id = id;
        data.published._state = _setPublishedState(data);
        return data.published;
      } else {
        return null;
      }
    } else {
      // since no published version exists return null or the draft version
      // if we requested it

      if (data.draft) {
        // add id for the client
        _addInfo(data.draft, data, id);
        return data.draft;
      } else {
        _addInfo(data.published, data, id);
        return data.published;
      }
    }
  });
};

var _addInfo = function (doc, data, id) {
  doc._id = id;
  doc._state = _setPublishedState(data);
  doc._created = data._created;
  doc._modified = data._modified;
  doc._published = data._published;
  doc._parent = data._parent;
};
//
// var insertDocument = function (doc, publishedVersion) {
//     // Get the documents collection
//     var collection = db.collection('documents');
//     // Insert some documents
//     return collection.findOne({'_id': new ObjectID(id)}).then(function (data) {
//         if (publishedVersion) {
//             data.draft = null;
//             data.published = doc;
//         } else {
//             data.draft = doc;
//         }
//         return collection.insertOne(doc);
//     });
// };

/**
 *
 * @param {object} doc
 * @param {boolean} publishedVersion
 * @returns {Promise<TResult>|*|Promise<TResult2|TResult1>|Promise<T>|Promise<U>}
 */
var updateDocument = function (doc, publishedVersion) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  if (doc._id) {
    return collection.findOne({'_id': new ObjectID(doc._id)}).then(function (data) {
      // if document could not be found
      if (data === null) throw new Error('Dataset could not be found: ' + doc._id);

      // add parent information to structure node and remove it from the data object
      if (doc._parent) {
        data._parent = doc._parent;
        delete doc._parent;
      }

      // TODO: remove id? => but needed in client to send correct updates back to this server
      delete doc._id;

      // update modified timestamp
      data._modified = new Date();

      if (publishedVersion) {
        data.draft = null;
        data.published = doc;
        data._published = data._modified;
      } else {
        data.draft = doc;
      }

      return collection.updateOne({_id: data._id}, data).then(function (result) {
          return data._id.toString();
      });
    });
  } else {
    var creationDate = new Date();
    var dbDoc = {
      _id: doc._id,
      _created: creationDate,
      _modified: creationDate
    };

    // add parent information to structure node and remove it from the data object
    if (doc._parent) {
      dbDoc._parent = doc._parent;
      delete doc._parent;
    }

    if (publishedVersion) {
      dbDoc.publish = doc;
      dbDoc._published = creationDate;
    } else {
      dbDoc.draft = doc;
    }

    return collection.insertOne(dbDoc).then(function (result) {
      return result.insertedId.toString();
    });
  }
};

var revert = function (id) {
  var collection = db.collection('documents');

  return collection.findOne({'_id': new ObjectID(id)}).then(function (data) {
    // only revert if published version exists
    if (!data.published) throw new Error('Dataset cannot be reverted, since it does not have a published version.');

    data.draft = null;
    data._modified = data._published;
    return collection.updateOne({_id: data._id}, data).then(function () {
      data.published._id = id;
      data.published._state = _setPublishedState(data);
      return data.published;
    });
  });
};

var deleteDocument = function (id) {
  var collection = db.collection('documents');

  return collection.deleteOne({_id: new ObjectID(id)});
};

var updateFullIndexSearch = function () {
  // TODO: update full index search
  var collection = db.collection('documents');
  collection.ensureIndex({"$**": "text"}, {name: "fullText"})
};


var getBehaviours = function () {
  var collection = db.collection('behaviours');
  // get all behaviours
  return collection.find({}).toArray();
};

var setBehaviour = function (behaviour) {
  var collection = db.collection('behaviours');
  // get all behaviours
  return collection.updateOne({_id: behaviour._id}, behaviour, {upsert: true});
};

var getChildDocuments = function (id) {
  var collection = db.collection('documents');

  // get all documents that have a parent with the given ID
  return collection.find({_parent: id}).toArray().then(processResults);
  /*function (docs) {
    var resultDocs = [];
    docs.forEach(function (doc) {
      if (doc.draft) {
        // add id for the client
        _addInfo(doc.draft, doc, doc._id);
        resultDocs.push(doc.draft);
      } else {
        _addInfo(doc.published, doc, doc._id);
        resultDocs.push(doc.published);
      }
    });
    return resultDocs;
  }, function (err) {
    console.error(err);
  });*/
};

var setChildInfoTo = function(id) {
  var collection = db.collection('documents');

  return collection.findOne({'_id': new ObjectID(id)}).then(function (data) {
    if (data && !data.hasChildren) {
      data.hasChildren = true;
      return collection.updateOne({_id: data._id}, data);
    }
  });
};

var getPathToDataset = function(id) {
  var collection = db.collection('documents');
  return collection.findOne({'_id': new ObjectID(id)}).then(function (data) {
    if (data._parent) {
      return getPathToDataset(data._parent).then(function(parents) {
        parents.push(data._id.toString());
        return parents;
      })
    } else {
      return [data._id.toString()];
    }
  });

};

module.exports = {
  connect: connect,
  closeDB: closeDB,
  // insertDocument: insertDocument,
  updateDocument: updateDocument,
  getDocument: getDocument,
  findDocuments: findDocuments,
  getChildDocuments: getChildDocuments,
  updateFullIndexSearch: updateFullIndexSearch,
  deleteDocument: deleteDocument,
  revert: revert,

  getBehaviours: getBehaviours,
  setBehaviour: setBehaviour,

  setChildInfoTo: setChildInfoTo,
  getPathToDataset: getPathToDataset
};