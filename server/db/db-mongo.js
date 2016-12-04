'use strict';

let MongoClient = require( 'mongodb' ).MongoClient,
  ObjectID = require( 'mongodb' ).ObjectID,
  Config = require( '../config' ),
  assert = require( 'assert' );

let db = null;

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
    let collection = db.collection( table );

    return collection.insertOne( data );
  },

  updateIntoTable: function(table, id, data) {
    let collection = db.collection( table );

    return collection.updateOne({_id: data._id}, data, {upsert: true});
  },

  deleteById: function(table, id) {
    let collection = db.collection( table );

    return collection.deleteOne({_id: getObjectId(id)});
  },

  findInTable: function (table, selector) {
    let collection = db.collection( table );

    if (collection === null) return Promise.reject( 'Collection not found: ' + table );

    // Find some documents
    return collection.find( selector ).toArray();
  },

  /**
   *
   * @param table
   * @param query
   * @param sort
   * @param reverse
   * @returns {Promise}
   */
  searchFor: function (table, query, sort, reverse) {
    let collection = db.collection( table );

    let sortObj = {};
    if (sort) {
      sortObj['draft.' + sort] = reverse ? 1 : -1;
    }

    // Find some documents
    if (query.trim().length > 0) {
      let result = collection.find( {$text: {$search: query}} );
      if (sort) result = result.sort(sortObj);
      return result.toArray();

    } else {
      let result = collection.find();
      if (sort) result = result.sort(sortObj);
      return result.toArray();
    }
  },

  getDocById: function (table, id) {
    let collection = db.collection( table );

    // Find some documents
    return collection.findOne( {'_id': getObjectId(id)} )
  },

  /**
   * Prepare the database for full text search.
   * @param {string} table
   */
  updateIndexForSearch: function(table) {
    let collection = db.collection(table);
    collection.ensureIndex({"$**": "text"}, {name: "fullText"})
  }
};

function getObjectId(id) {
  let realId = id;

  try {
    realId = new ObjectID( id );
  } catch (ex) {}

  return realId;
}