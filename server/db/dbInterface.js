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

var findDocuments = function (query) {
    // Get the documents collection
    var collection = db.collection('documents');

    var processResults = function (results) {
        return results.map(function (res) {
            // set the id inside the document
            if (res.draft) {
                res.draft._id = res._id;
                return res.draft;
            } else {
                res.published._id = res._id;
                return res.published;
            }
        });
    };
    // Find some documents
    if (query.trim().length > 0) {
        return collection.find({ $text: { $search: query}}).toArray().then(processResults);
    } else {
        return collection.find().toArray().then(processResults);
    }
};

var getDocument = function (id, publishedVersion) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Find some documents
    return collection.findOne({'_id': new ObjectID(id)}).then(function (data) {
        if (publishedVersion && data.published) {
            // only return the published version if it exists

            // add id for the client
            data.published._id = id;
            return data.published;
        } else {
            // since no published version exists return null or the draft version
            // if we requested it

            // add id for the client
            data.draft._id = id;
            return publishedVersion ? null : data.draft;
        }
    });
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

            // TODO: remove id? => but needed in client to send correct updates back to this server
            delete doc._id;

            if (publishedVersion) {
                data.draft = null;
                data.published = doc;
            } else {
                data.draft = doc;
            }

            return collection.updateOne({_id: data._id}, data);
        });
    } else {
        var dbDoc = {
            _id: doc._id
        };
        publishedVersion ? dbDoc.publish = doc : dbDoc.draft = doc;
        return collection.insertOne(dbDoc).then(function (result) {
            return result.insertedId.toString();
        });
    }
};

var deleteDocument = function(id) {
    var collection = db.collection('documents');

    return collection.deleteOne({_id: new ObjectID(id)});
};

var updateFullIndexSearch = function() {
    // TODO: update full index search
    var collection = db.collection('documents');
    collection.ensureIndex({"$**": "text"}, {name: "fullText"})
};

module.exports = {
    connect: connect,
    closeDB: closeDB,
    // insertDocument: insertDocument,
    updateDocument: updateDocument,
    getDocument: getDocument,
    findDocuments: findDocuments,
    updateFullIndexSearch: updateFullIndexSearch,
    deleteDocument: deleteDocument
};