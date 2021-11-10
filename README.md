# Swagger generated server

Spring Boot Server

## Development

### Configure the server

The server uses several spring profiles to be configured for different environments.

- dev => used for development, which disables keycloak authentication
- default => also used for development and is set up in `server/src/develop/resources`
- mcloud, ... => profile for customer implementation (import, export, fields, ...)

The profiles can be set in the startup configuration or in the application.properties under `server/src/main/resources`.
We suggest to use the startup configuration to prevent accidentally commit of development changes.

#### Database

The application requires a PostgreSQL database instance which is configured in application.properties.

A Docker container to be used in development can be created by running the following command in the `postgres` directory:

> docker-compose up -d

See also `postgres/.env` for further configuration.

You need to manually create an empty database with the name 'ige' .
The database gets initialized on startup. Afterwards you can map your db data directory in the docker-compose file to make it persistent.

### Start the client and server

For IntelliJ configuration see the section below.

#### Server

You can also run the server from command line:

> ./gradlew bootRun --args='--spring.profiles.active=dev,mcloud,elasticsearch'

With the following command a jar is generated, which contains the whole server including
optimized frontend application:

> ./gradlew -PbuildProfile=prod clean build

**TBD:** create an installer instead

#### Client

For the client just run `npm start` in the frontend directory. When developing for Internet Explorer please run `npm run start-ie11`.

### Setup IntelliJ IDEA

- Open IntelliJ
- Import project
  - _If first project in IntelliJ_ Open or Import > Select `build.gradle` > Open as Project > OK
  - _Else_ File > New > Project from Existing Sources... > Select `build.gradle` > OK
- Create **server run configuration**
  - **NOTE** Java 11 SDK is required
  - Right click file _server/src/main/java/de/ingrid/igeserver/IgeServer.kt_ > Run
  - Run > Edit Configurations > Kotlin > IgeServerKt
    - VM options: `-Dspring.profiles.active=dev,mcloud,elasticsearch`
    - Shorten Commandline: JAR manifest
    - JRE: _path/to/java-11-jdk_
- Install **frontend packages**
  - Open a shell in root directory of the project
  - Install _yarn_ if not installed yet: `npm -g i yarn`
  - Install packages: `yarn --cwd ./frontend`
- Create **frontend run configuration**
  - Run > Edit Configurations > + (new configuration) >
    - _community edition_ Shell Script
      - Script path: _path/to/npm_
      - Script options: `start`
      - Working directory: _path/to/frontend_
      - Interpreter path: _empty_
    - _ultimate edition_ npm
      - It just works (Andre)

You are all set. Run server and frontend with the appropriate run configuration.

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
```

To get the swagger-api json documentation go to http://localhost:8550/api-docs. The UI version can be accessed with http://localhost:8550/swagger-ui.html, where you also can test the API.

# Tests

For end-to-end tests with Cypress check out the README.md inside `frontend/e2e` directory.

# Release

## Update changelog

We use the standard of [Keep a Changelog](https://keepachangelog.com/).

The gradle-changelog-plugin can be used to update the unreleased section to the current version
and to create a new unreleased section.

## Release a new version

TODO

# Jenkins Setup

The following behaviours for the Jenkins project have to be applied:

- Advanced clone behaviours
  - to fetch tags so that the correct version is calculated
- Check out to matching local branch
  - to get branch information for creating correct tag for docker image

# FAQ

## Error after login: ERR_TOO_MANY_REDIRECTS

A problem occurs when running Keycloak and Application in a docker container on your local machine. Then it's important that the access to the keycloak instance is the same for the backend as in the frontend in the browser, which happens actually on the local machine (not inside docker). Therefore you need to configure "/etc/hosts" file or under windows "c:\Windows\System32\Drivers\etc\hosts" and add the following entry:

> 127.0.0.1 keycloak

In your docker-compose file you would then use for your app the environment variable "KEYCLOAK_URL=http://keycloak:8080/auth" to access keycloak in the container. Moreover make sure the port mapping is the same "8080:8080" otherwise keycloak won't be able to map correctly.

## Add a new keycloak user

When adding a new keycloak user, make sure to assign the correct roles: ige-user (needed!) and optional ige-user-manager or ige-super-admin
