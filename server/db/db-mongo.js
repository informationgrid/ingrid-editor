var MongoClient = require( 'mongodb' ).MongoClient,
  ObjectID = require( 'mongodb' ).ObjectID,
  Config = require( '../config' ),
  assert = require( 'assert' );

var db = null;

module.exports = {

  connect: function () {
    return new Promise( function (resolve) {
      MongoClient.connect( Config.database.url, function (err, dbInstance) {
        assert.equal( null, err );
        console.log( "Connected successfully to server" );
        db = dbInstance;
        resolve();
      } );
    } );
  },

  close: function () {
    db.close();
  },

  insertIntoTable: function (table, data) {
    var collection = db.collection( table );

    return collection.insertOne( data );
  },

  updateIntoTable: function(table, id, data) {
    var collection = db.collection( table );

    return collection.updateOne({_id: data._id}, data, {upsert: true});
  },

  deleteById: function(table, id) {
    var collection = db.collection( table );

    return collection.deleteOne({_id: getObjectId(id)});
  },

  findInTable: function (table, selector) {
    var collection = db.collection( table );

    if (collection === null) return Promise.reject( 'Collection not found: ' + table );

    // Find some documents
    return collection.find( selector ).toArray();
  },

  searchFor: function (table, query) {
    var collection = db.collection( table );

    // Find some documents
    if (query.trim().length > 0) {
      return collection.find( {$text: {$search: query}} ).toArray();
    } else {
      return collection.find().toArray();
    }
  },

  getDocById: function (table, id) {
    var collection = db.collection( table );

    // Find some documents
    return collection.findOne( {'_id': getObjectId(id)} )
  },

  /**
   * Prepare the database for full text search.
   * @param {string} table
   */
  updateIndexForSearch: function(table) {
    var collection = db.collection(table);
    collection.ensureIndex({"$**": "text"}, {name: "fullText"})
  }
};

function getObjectId(id) {
  var realId = id;

  try {
    realId = new ObjectID( id );
  } catch (ex) {}

  return realId;
}