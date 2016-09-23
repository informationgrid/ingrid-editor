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

var getDocument = function (id) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Find some documents
    return collection.findOne({'_id': new ObjectID(id)});
};

var insertDocument = function (doc) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    return collection.insertOne(doc);
};


var updateDocument = function (doc) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    if (doc._id) {
        doc._id = new ObjectID(doc._id);
        return collection.updateOne({_id: doc._id}, doc, {upsert: false});
    } else {
        return collection.insertOne(doc).then(function (result) {
            return result.insertedId.toString();
        });
    }
};

module.exports = {
    connect: connect,
    closeDB: closeDB,
    insertDocument: insertDocument,
    updateDocument: updateDocument,
    getDocument: getDocument
};