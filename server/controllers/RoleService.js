'use strict';

let Config = require( '../config' ),
  db = require( '../db/RoleDao' );

class RoleService {

  list(args, res) {
    db.getRoles().then( function (user) {
      res.end( JSON.stringify( user, null, 2 ) );

    } ).catch( function (err) {
      res.statusCode = 403;
      res.end( err.message );

    } );
  };

  getRole(args, res, next) {
    let login = args.id.value;

    db.findRole( login ).then( function (user) {
      // remove password
      delete user.password;

      // send back to client
      res.end( JSON.stringify( user, null, 2 ) );

    } ).catch( function (err) {
      res.statusCode = 404;
      res.end( err.message );
    } );
  }

  createRole(args, res) {
    let login = args.id.value;
    let data = args.user.value;

    db.findRole( login ).then( (user) => {

      if (user) {

        res.statusCode = 406;
        res.end( "User already exists" );

      } else {

        // if user does not exist
        let password = bcrypt.hashSync( data.password, 8 );

        db.createUser( data.login, password, data.firstName, data.lastName ).then( () => {
          res.end();
        } ).catch( function (err) {
          res.statusCode = 500;
          res.end( err.message );
        } );

      }
    }, () => {

      res.statusCode = 500;
      res.end( "Error requesting users: " + error );

    } )
  }

  updateRole(args, res) {
    let id = args.id.value;
    let data = args.role.value;

    db.findRole( id )
      .then( (role) => {
        data._id = role._id;
        return db.updateRole( data )
      } )
      .then( () => {
        res.end();
      } )
      .catch( function (err) {
        res.statusCode = 500;
        res.end( err.message );
      } );
  }

  deleteRole(args, res) {
    let id = args.id.value;

    db.deleteRole( id )
      .then( () => res.end() )
      .catch( error => {
        res.statusCode = 500;
        res.end( "Error deleting user: " + error );
      } )
  }
}

module.exports = new RoleService();