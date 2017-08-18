'use strict';

let pg = require( 'pg' );
let fs = require( 'fs' );
let log = require( 'log4js' ).getLogger();

const connectionString = process.env.DATABASE_URL || 'postgres://root@localhost:5432/test';
let client = null;

// TODO: check out -> https://github.com/dmfay/massive-js

// TODO: initialize tables
/*
CREATE TABLE documents (
    id SERIAL primary key,
    parent int,
    data JSONB
);

CREATE TABLE role (
    id SERIAL primary key,
    data JSONB
);

CREATE TABLE users (
    id SERIAL primary key,
    data JSONB
);

CREATE TABLE behaviours (
    id text primary key,
    data JSONB
);
 */

module.exports = {

  connect: function () {
    client = new pg.Client( connectionString );
    return client.connect();
  },

  close: function () {
    client.end()
      .then( () => log.info( 'client has disconnected' ) )
      .catch( err => log.error( 'error during disconnection', err.stack ) )
  },

  insertIntoTable: function (table, data, id) {
    // const query = {
    //   name: 'insert-row',
    //   text: 'INSERT INTO $1::text VALUES(DEFAULT, $2)',
    //   values: [table, data],
    //   rowMode: 'array'
    // };

    let query = null;
    const idValue = id ? '\'' + id + '\'' : 'DEFAULT';
    const onConflict = ' ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data';

    if (table === "documents") {
      query = 'INSERT INTO ' + table + ' VALUES(' + idValue + ', null, \'' + JSON.stringify( data ) + '\')' + onConflict;
    } else {
      query = 'INSERT INTO ' + table + ' VALUES(' + idValue + ', \'' + JSON.stringify( data ) + '\')' + onConflict;
    }

    return new Promise( function (resolve, reject) {
      const queryResponse = client.query( query + ' RETURNING id', [], (error, result) => {
        if (error) {
          reject( error );
        } else {
          log.info( "INSERT:", result );
          const response = result.rows[ 0 ];
          response.insertedId = result.rows[ 0 ].id;
          resolve( response );
        }
      } );
    } );


    /*let collection = db.collection( table );

    return new Promise(function(resolve) {
      collection.insert( data, {upsert: true}, (err, result) => {
        if (result) {
          result[0].insertedId = result[0]._id;
        }
        resolve(result ? result[0]: result);
      });
    } );*/
  },

  updateIntoTable: function (table, id, data) {
    const query = 'UPDATE ' + table + ' SET data = \'' + JSON.stringify( data ) + '\' WHERE id = ' + id;
    return new Promise( (resolve, reject) => {
      const queryResponse = client.query( query + ' RETURNING id', [], (error, result) => {
        if (error) {
          reject( error );
        } else {
          log.info( "UPDATE:", result );
          const response = result.rows[ 0 ];
          // response.insertedId = result.rows[ 0 ].id;
          resolve( response );
        }
      } );
    } );
  },

  deleteById: function (table, id) {
    const query = 'DELETE FROM ' + table + ' WHERE id = ' + id;
    return client.query(query);

    /*return new Promise( resolve => {
      collection.remove( {_id: this.getObjectId( id )}, (err, result) => resolve( result ) );
    } )*/
  },

  findInTable: function (table, selector) {
    let where = "";
    let query = null;
    if (selector) {
      for (var key in selector) {
        if (selector.hasOwnProperty( key )) {
          where = 'data->>\'' + key + '\' LIKE \'%' + selector[ key ] + '%\'';
        }
      }
    }

    if (where.trim() === '') {
      query = 'SELECT * FROM ' + table;
    } else {
      query = 'SELECT * FROM ' + table + ' WHERE ' + where;
    }
    return client.query( query )
      .then( result => {
        log.info( "FOUND:", result );
        return this.mapDocResults( result.rows );
      } )
      .catch( error => {
        log.error( "ERROR (FOUND):", error );
      } );
    /*let collection = db.collection( table );

    if (collection === null) return Promise.reject( 'Collection not found: ' + table );

    // Find some documents
    return new Promise(function(resolve) {
      if (selector == null) {
        collection.find().toArray( (err, data) => {
          if (data) {
            let filtered = data.filter( entry => entry._parent === undefined);
            resolve(filtered);

          } else {
            resolve([]);
          }
        });

      } else {
        let query = selector;
        if (selector.roles) {
          query = { roles : { "$in": [ selector.roles]}}
        }
        collection.find( query ).toArray( (err, data) => resolve(data ? data : []) );

      }
    });*/
    return Promise.resolve( [] );
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
    return new Promise( (resolve, reject) => {
      client.query( "SELECT data FROM " + table )
        .then( result => {
          const mapped = this.mapDocResults( result.rows );
          resolve( mapped );
        } )
        .catch( error => log.error( "Error", error ) );
    } );
    /*let collection = db.collection( table );

    let sortObj = {};
    if (sort) {
      if (rootFields.indexOf( sort ) !== -1) {

        sortObj[ sort ] = reverse ? 1 : -1;

      } else {

        sortObj[ 'draft.' + sort ] = reverse ? 1 : -1;

      }
    }

    // Find some documents
    return new Promise( function (resolve) {
      if (query.trim().length > 0) {
        let splitted = query.split( ':' );
        let selector = {};
        selector[ 'draft.' + splitted[ 0 ] ] = splitted[ 1 ];
        collection.find( selector ).toArray( (err, data) => resolve( data ) );

      } else {
        let result = collection.find();
        if (sort) result = result.sort( sortObj );

        return result.toArray( (err, data) => resolve( data ) );
      }
    } );*/
  },

  getDocById: function (table, id, useRaw) {
    const results = [];

    // Stream results back one row at a time
    /*query.on('row', (row) => {
      results.push(row);
    });*/

    // Find some documents
    return new Promise( (resolve, reject) => {
      // After all data is returned, close connection and return results
      /*query.on('end', () => {
        // done();
        return resolve(results[0]);
      });*/
      const query = client.query( 'SELECT id, data FROM ' + table + ' WHERE id=' + parseInt( id ) )
      query.then( result => {
        const mapped = this.mapDocResults( result.rows );
        resolve( mapped[ 0 ] );
      }, error => {
        console.error( "Error querying db", error );
      } )
    } );
  },

  /**
   * Prepare the database for full text search.
   * @param {string} table
   */
  updateIndexForSearch: function (table) {
    // let collection = db.collection( table );
    // collection.ensureIndex( {"$**": "text"}, {name: "fullText"} )
  },

  getObjectId(id) {
    /*if (id instanceof ObjectID) return id;

    let realId = id;

    try {
      realId = new ObjectID( id );
    } catch (ex) {}

    return realId;*/
    return null;
  },

  mapDocResults(rows) {
    rows.forEach( row => {
      row.data._id = row.id;
    } );
    return rows.map( row => row.data );
  }
};

