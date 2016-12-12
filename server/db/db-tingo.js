'use strict';

let Engine = require('tingodb')(),
  ObjectID = Engine.ObjectID,
  assert = require( 'assert' );

let db = null;

const rootFields = ['_modified'];

module.exports = {

  connect: function () {
    db = new Engine.Db('./tingoDB', {});
    return Promise.resolve();
  },

  close: function () {
    db.close();
  },

  insertIntoTable: function (table, data) {
    let collection = db.collection( table );

    return new Promise(function(resolve) {
      collection.insert( data, {upsert: true}, (err, result) => {
        if (result) {
          result[0].insertedId = result[0]._id;
        }
        resolve(result ? result[0]: result);
      });
    } );
  },

  updateIntoTable: function(table, id, data) {
    let collection = db.collection( table );

    return new Promise(function(resolve) {
      collection.update( {_id: data._id}, data, {upsert: true}, (err, result) => resolve(result) );
    });
  },

  deleteById: function(table, id) {
    let collection = db.collection( table );

    return new Promise(resolve => {
      collection.remove( {_id: this.getObjectId( id )}, (err, result) => resolve(result) );
    })
  },

  findInTable: function (table, selector) {
    let collection = db.collection( table );

    if (collection === null) return Promise.reject( 'Collection not found: ' + table );

    // Find some documents
    return new Promise(function(resolve) {
      if (selector == null) {
        collection.find().toArray( (err, data) => resolve(data) );

      } else {
        collection.find( selector ).toArray( (err, data) => resolve(data) );

      }
    });

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
      if (rootFields.indexOf(sort) !== -1) {

        sortObj[sort] = reverse ? 1 : -1;

      } else {

        sortObj['draft.' + sort] = reverse ? 1 : -1;

      }
    }

    // Find some documents
    return new Promise(function(resolve) {
      if (query.trim().length > 0) {
        let result = collection.find( {$text: {$search: query}} );
        if (sort) result = result.sort( sortObj );
        return result.toArray( (err, data) => resolve(data) );

      } else {
        let result = collection.find();
        if (sort) result = result.sort( sortObj );

        return result.toArray( (err, data) => resolve(data) );
      }
    });
  },

  getDocById: function (table, id, useRaw) {
    let collection = db.collection( table );

    // Find some documents
    return new Promise((resolve, reject) => {
      collection.findOne( {'_id': useRaw ? id : this.getObjectId( id )}, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      } );
    });
  },

  /**
   * Prepare the database for full text search.
   * @param {string} table
   */
  updateIndexForSearch: function(table) {
    let collection = db.collection(table);
    collection.ensureIndex({"$**": "text"}, {name: "fullText"})
  },

  getObjectId(id) {
    if (id instanceof ObjectID) return id;

    let realId = id;

    try {
      realId = new ObjectID( id );
    } catch (ex) {}

    return realId;
  }
};

