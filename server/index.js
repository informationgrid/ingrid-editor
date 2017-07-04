'use strict';

let Config = require('./config');
let log4j = require('log4js');
let app = require('connect')();
let http = require('http');
let swaggerTools = require('swagger-tools');
let jsyaml = require('js-yaml');
let fs = require('fs');
let Jwt = require('jsonwebtoken');
let bodyParser = require('body-parser'),
    bcrypt = require('bcryptjs'),
    db = require('./db/dbInterface'),
    dbRole = require('./db/RoleDao'),
    dbUser = require('./db/UserDao');
let serverPort = 8081;

log4j.configure('log4js.json');
let log = log4j.getLogger();

// swaggerRouter configuration
let options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
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
let spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
let swaggerDoc = jsyaml.safeLoad(spec);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
    log.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    log.info('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    db.connect().then(function() {

      return dbUser.hasAdminUser();

    }).then(function (adminExists) {

      if (!adminExists) {
        // TODO: accept user input for admin password
        log.info('Admin does not exists in database. A user was added with default password "admin".');

        let hash = bcrypt.hashSync('admin', 8);
        let objId = db.getClient().getObjectId(-1);
        dbRole.createRole(-1, 'admin');
        dbRole.createRole(-2, 'author');
        dbUser.createUser('admin', hash, 'The', 'Administrator', [-1]);
      }
    }).catch(function(ex) {

      log.error('Error starting up DB connection', ex);

    });

  });


  function setupSwaggerSecurity(middleware) {
    return middleware.swaggerSecurity({
        jwt: function(req, authOrSecDef, scopes, callback) {
          if (!req.headers.authorization) {
            callback(new Error('No authorization header in request'));
            return;
          }

          let token = req.headers.authorization.substring(Config.key.headerPrefix.length);
          log.debug("inside swagger security: jwt token", token);

          let result = Jwt.verify(token, Config.key.publicKey,  {algorithms: ['RS256']}, function (err, decoded) {
            if (err) {
              log.error("Error: ", err);
              callback(new Error('Failed'));
              return;
            }
            log.debug('result: ', decoded);
            callback();
          });
        }
    });
  }

});
