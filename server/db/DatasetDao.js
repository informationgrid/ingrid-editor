'use strict';

let log = require('log4js').getLogger();
let dbInterface = require('./dbInterface');

class DatasetDao {

  constructor() {
    this.client = dbInterface.getClient();
  }

  /**
   *
   * @param query
   * @param sort
   * @param reverse
   * @returns {Promise.<>}
   */
  findDocuments(query, sort, reverse) {

    return this.client.searchFor('documents', query, sort, reverse)
      .then((data) => this.processResults(data));

  };

  /**
   * Get a document identified by its' ID.
   * @param {string} id
   * @param {boolean} publishedVersion
   */
  getDocument(id, publishedVersion) {

    return this.client.getDocById('documents', id)
      .then((data) => {
        if (publishedVersion === true) {
          if (data.published) {
            // only return the published version if it exists

            // add id for the client
            data.published._id = id;
            data.published._state = this._setPublishedState(data);
            return data.published;
          } else {
            return null;
          }
        } else {
          // since no published version exists return null or the draft version
          // if we requested it

          if (data.draft) {
            // add id for the client
            this._addInfo(data.draft, data, id);
            return data.draft;

          } else {

            this._addInfo(data.published, data, id);
            return data.published;
          }
        }
      })
      .catch( err => log.error("Error getting document", err) );
  };

  _addInfo(doc, data, id) {
    doc._id = id;
    doc._state = this._setPublishedState(data);
    doc._created = data._created;
    doc._modified = data._modified;
    doc._modifiedBy = data._modifiedBy;
    doc._published = data._published;
    doc._parent = data._parent;
  };

//
// insertDocument(doc, publishedVersion) {
//     // Get the documents collection
//     let collection = db.collection('documents');
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
   * @param {string} userId
   * @returns {Promise<>}
   */
  updateDocument(doc, publishedVersion, userId) {

    // Insert some documents
    if (doc._id) {
      return this.client.getDocById('documents', doc._id)
        .then((data) => {
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

          // TODO: add user information who modified this dataset
          data._modifiedBy = userId;

          if (publishedVersion) {
            data.draft = null;
            data.published = doc;
            data._published = data._modified;
          } else {
            data.draft = doc;
          }

          return this.client.updateIntoTable('documents', data._id, data)
            .then(() => {
              let doc = {};
              this._addInfo(doc, data, data._id.toString());
              return doc;
            });
        });
    } else {
      let creationDate = new Date();
      let dbDoc = {
        _id: doc._id,
        _created: creationDate,
        _modified: creationDate,
        _modifiedBy: userId
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

      return this.client.insertIntoTable('documents', dbDoc)
        .then((result) => {
          let doc = {};
          this._addInfo(doc, dbDoc, result.insertedId.toString());
          return doc;
        });
    }
  };

  revert(id) {
    return this.client.getDocById('documents', id)
      .then((data) => {
        // only revert if published version exists
        if (!data.published) throw new Error('Dataset cannot be reverted, since it does not have a published version.');

        data.draft = null;
        data._modified = data._published;
        return this.client.updateIntoTable('documents', data._id, data)
          .then(() => {
            data.published._id = id;
            data.published._state = this._setPublishedState(data);
            return data.published;
          });
      });
  };

  deleteDocument(id) {
    return this.client.deleteById('documents', id);
  };


  _setPublishedState(dataset) {
    if (dataset.published && dataset.draft) {
      return "PW";
    } else if (dataset.published) {
      return "P";
    } else {
      return "W";
    }
  };

  processResults(results) {
    return results.map((res) => {
      // set the id inside the document
      if (res.draft) {
        res.draft._id = res._id;
        if (res.hasChildren) res.draft.hasChildren = true;
        res.draft._state = this._setPublishedState(res);
        this._addInfo(res.draft, res, res._id);
        return res.draft;
      } else {
        res.published._id = res._id;
        if (res.hasChildren) res.published.hasChildren = true;
        res.published._state = this._setPublishedState(res);
        this._addInfo(res.published, res, res._id);
        return res.published;
      }
    });
  };

  getChildDocuments(id) {
    let selector = id === null ? null : {_parent: id};
    return this.client.findInTable('documents', selector)
      .then(
        data => this.processResults(data),
        err => log.error(err)
      );
  };

  setChildInfoTo(id) {

    return this.client.getDocById('documents', id)
      .then((data) => {
        if (data && !data.hasChildren) {
          data.hasChildren = true;
          return this.client.updateIntoTable('documents', data._id, data);
        }
      });
  };

  getPathToDataset(id) {
    return this.client.getDocById('documents', id)
      .then((data) => {
        if (data._parent) {
          return this.getPathToDataset(data._parent).then((parents) => {
            parents.push(data._id.toString());
            return parents;
          })
        } else {
          return [data._id.toString()];
        }
      });
  };

  /**
   * Check if a dataset has children and remove the flag if there are no more.
   * This function should be called if a document was deleted.
   * @param id is the id of the document to check for children
   */
  checkForChildren(id) {

    return this.getChildDocuments(id).then((children) => {
      if (children.length === 0) {
        return this.client.getDocById('documents', id)
          .then((data) => {
            data.hasChildren = false;
            return this.client.updateIntoTable('documents', data._id, data);
          });
      }
    });
  };
}

module.exports = new DatasetDao();
