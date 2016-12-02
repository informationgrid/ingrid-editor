'use strict';

var Config = require('./config');
var app = require('connect')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var Jwt = require('jsonwebtoken');
var bodyParser = require('body-parser'),
    db = require('./db/dbInterface');
var serverPort = 8080;
var HEADER_PREFIX = "Bearer ";

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

app.use(bodyParser.json());

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  app.use(setupSwaggerSecurity(middleware));

  // Validate Swagger requests
  app.use(middleware.swaggerValidator({
    validateResponse: false
  }));

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

/*  app.use(function (err, req, res, next) {
    console.log('in custom security function');
    if (err.message === 'Failed to authenticate') {
      err.message = 'Custom error for Juho: ' + err.message;
    }

    next(err);
  });*/

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);

    db.connect().then(function() {

      return db.hasAdminUser();

    }).then(function (adminExists) {

      if (!adminExists) {
        // TODO: accept user input for admin password
        console.log('Admin does not exists in database. Please set the password for the admin user:');

        db.createUser('admin', 'admin', -1);
      }
    }).catch(function(ex) {

      console.error(ex);

    });

  });


  function setupSwaggerSecurity(middleware) {
    return middleware.swaggerSecurity({
        jwt: function(req, authOrSecDef, scopes, callback) {
          var token = req.headers.authorization.substring(HEADER_PREFIX.length);
          console.log("inside swagger security: jwt token", token);
          var result = Jwt.verify(token, Config.key.privateKey, function (err, decoded) {
            if (err) {
              console.error("Error: ", err);
              callback(new Error('Failed'));
              return;
            }
            console.log('result: ', decoded);
            callback();
          });
          //   if(err) callback(new Error('Error in passport authenticate'));
          //   if(!user) callback(new Error('Failed to authenticate oAuth token'));
          //   req.user = user;
        }
    });
  }

});
