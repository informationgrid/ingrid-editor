# Swagger generated server

Spring Boot Server

## Development

### Configure the server

The server uses several spring profiles to be configured for different environments.

* dev => used for development, which disables keycloak authentication
* default => also used for development and is set up in `src/develop/resources`
* mcloud, ... => profile for customer implementation (import, export, fields, ...)

The profiles can be set in the startup configuration or in the application.properties under `src/main/resources`.
We suggest to use the startup configuration to prevent accidentally commit of development changes. 

### Start the client and server
For IntelliJ configuration see the section below.

#### Server
You can also run the server from command line:

> ./gradlew bootRun --args='--spring.profiles.active=default,dev,mcloud'

The database will be created inside the directory where the command was executed.

With the following command a jar is generated, which contains the whole server including
optimized frontend application: 

> ./gradlew -PbuildProfile=prod clean build

**TBD:** create an installer instead

#### Client
For the client just run `npm start` in the frontend directory. When developing for Internet Explorer please run `npm run start-ie11`.


### Setup IntelliJ IDEA
* Open IntelliJ
* Import project
  * *If first project in IntelliJ* Open or Import > Select `build.gradle` > Open as Project > OK
  * *Else* File > New > Project from Existing Sources... > Select `build.gradle` > OK
* Create **server run configuration**
  * **NOTE** Java 11 SDK is required
  * Right click file *server/src/main/java/de/ingrid/igeserver/IgeServer.kt* > Run
  * Run > Edit Configurations > Kotlin > IgeServerKt
    * VM options: `-Dspring.profiles.active=default,dev,mcloud` 
    * Shorten Commandline: JAR manifest
    * JRE: *path/to/java-11-jdk*
* Install **frontend packages** 
  * Open a shell in root directory of the project
  * Install *yarn* if not installed yet: `npm -g i yarn`
  * Install packages: `yarn --cwd ./frontend`
* Create **frontend run configuration**
  * Run > Edit Configurations > + (new configuration) > 
    * *community edition* Shell Script
      * Script path: *path/to/npm*
      * Script options: `start`
      * Working directory: *path/to/frontend*
      * Interpreter path: *empty*
    * *ultimate edition* npm
      * It just works (Andre)

 You are all set. Run server and frontend with the appropriate run configuration.


### OrientDB Studio

Copy the zip file from the distribution (e.g. https://s3.us-east-2.amazonaws.com/orientdb3/releases/3.0.26/orientdb-3.0.26.zip) and extract the file "plugins/orient-studio-<version>.zip" into the plugins directory.
After a restart of the server the Studio should be available under http://10.0.75.1:2480/studio/index.html (login *admin*/*admin*).

**NOTE** When starting the application, the studio will be available under the IP and Port found in the logs.

If this does not work, check the logs for a correct link. Otherwise unpack the zip-file into "src/site" (everything under www).
It's possible that the database cannot be found because there're wrong api calls. Open main.js file and search for "/api/" and replace it with "/".

## Apache Configuration
For the apache configuration use the following settings:

```
location /ige-server/ {
    add_header 'Access-Control-Allow-Origin' *;
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT,DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With';
    proxy_pass http://192.168.0.238:8111/;
}

location /orientdb-studio/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://192.168.0.238:2480/;
}
```

To get the swagger-api json documentation go to http://localhost:8550/api-docs. The UI version can be accessed with http://localhost:8550/swagger-ui.html, where you also can test the API.

# Tests

For end-to-end tests with Cypress check out the README.md inside `frontend/e2e` directory.

# Release

## Update changelog

We use the standard of  [Keep a Changelog](https://keepachangelog.com/).

The gradle-changelog-plugin can be used to update the unreleased section to the current version
and to create a new unreleased section.

## Release a new version

TODO

# Jenkins Setup

The following behaviours for the Jenkins project have to be applied:

* Advanced clone behaviours
  * to fetch tags so that the correct version is calculated
* Check out to matching local branch
  * to get branch information for creating correct tag for docker image

# FAQ

## Error after login: ERR_TOO_MANY_REDIRECTS

Check if the keycloak.credentials.secret is correct. The logs should tell if the secret is not correct and show a message "Failed to turn code into token"

## Still having the error: ERR_TOO_MANY_REDIRECTS

Another problem occurs when running Keycloak and Application in a docker container on your local machine. Then it's important that the access to the keycloak instance is the same for the backend as in the frontend in the browser, which happens actually on the local machine (not inside docker). Therefore you need to configure "/etc/hosts" file or under windows "c:\Windows\System32\Drivers\etc\hosts" and add the following entry:

> 127.0.0.1 keycloak

In your docker-compose file you would then use for your app the environment variable "KEYCLOAK_URL=http://keycloak:8080/auth" to access keycloak in the container. Moreover make sure the port mapping is the same "8080:8080" otherwise keycloak won't be able to map correctly. 

## Add a new keycloak user

When adding a new keycloak user, make sure to assign the correct roles: admin, superadmin
Do not forget to assign the client-roles as well: realm-management -> manage-users
