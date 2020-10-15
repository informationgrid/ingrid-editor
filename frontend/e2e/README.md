# Running Cypress tests

In order to run the cypress tests you first need to edit the file `cypress.json`
to set the correct `baseUrl`. By default the IP address of the test system is configured.

## Local tests

If we want to run our tests locally then we have to fulfill the following preconditions:

* patch keycloak-test-library, to make client-secret work
  
  * in IntelliJ right-click on "keycloak.patch" and "Apply patch..."
* edit `cypress.json` to set application URL and Keycloak URL
  ```json
  {
    "baseUrl": "http://localhost:8550",
    "env": {
      "auth_base_url": "https://keycloak.informationgrid.eu/auth"
    }
  }
  ```
* edit `server/src/develop/resources/application-default.properties`:
  ```properties
  keycloak.auth-server-url=https://keycloak.informationgrid.eu/auth
  ```
* use the test database
  
  * copy database content from docker-setup-project `ige-ng/compose-files/qs/databases` into `server/databases`
* run backend with following command
  
  * ```gradlew.bat bootRun -PbuildProfile=cypress --args='--spring.profiles.active=default,mcloud'```
  * add ```-Dorg.gradle.java.home=/path_to_jdk_directory``` if you want to specify a different Java SDK
* create a new catalog or use the test catalog

If we are all set, then we can run the test by executing the following command inside the e2e-folder:

```bash
npm run cypress:run
```

And to run a single test:
```bash
npm run cypress:run -- --record --spec "cypress/integration/documents/type/mcloud.spec.ts"
```

# Tests Convention

For each topic a spec file should be written It's also possible to define multiple
describe blocks within a spec-file for better organization.

# 

