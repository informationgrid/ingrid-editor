# Running Cypress tests

In order to run the cypress tests you first need to edit the file `cypress.json` to set the correct `baseUrl`.
The `baseUrl` is set by default to the IP address of the test system.

## Local tests

If we want to run our tests locally then we have to fulfill the following preconditions:

- patch keycloak-test-library, to make client-secret work

  - in IntelliJ right-click on "keycloak.patch" and "Apply patch..."

- edit `cypress.json` to set application URL and Keycloak URL
  ```json
  {
    "baseUrl": "http://localhost:8550",
    "env": {
      "auth_base_url": "https://keycloak.informationgrid.eu"
    }
  }
  ```
- edit `server/src/develop/resources/application-default.properties`:
  ```properties
  keycloak.auth-server-url=https://keycloak.informationgrid.eu
  ```
- use the test database

  - copy database content from docker-setup-project `ige-ng/compose-files/qs/databases` into `server/databases`

- run backend with following command

  - `gradlew.bat bootRun -PbuildProfile=cypress --args='--spring.profiles.active=default,mcloud'`
  - add `-Dorg.gradle.java.home=/path_to_jdk_directory` if you want to specify a different Java SDK

- create a new catalog or use the test catalog

If we are all set, then we can run the test by executing the following command inside the e2e-folder:

```bash
npm run cypress:run
```

and to run a single test:

```bash
npm run cypress:run -- --record --spec "cypress/integration/documents/type/mcloud.spec.ts"
```

# Tests Convention

- For each topic write a spec-file, called `<name>.spec.ts`
- general tests must be written in root structure
- profile specific tests must be written inside `profile-folder`, e.g. `profile/uvp/export.spec.ts`
- Multiple describe blocks can be defined within a spec-file for better organization.
- naming convention for users
  - `<catalog-type>-<user-role>[-<purpose>]`
  - e.g. `test-catalog`, `test-author-no-groups`, `uvp-meta`

# Email - Test

Email tests are required to assess the email sending functionality of the software.
A smtp-server is created through the 'smtp-tester' package to accept connections to a given port, receives mails and else.
The server is configured in the `/plugins/index.js` file and initiated at the given port.
By means of cypress tasks the last email can be fetched and the inbox cleaned.

The "cromeWebSecurity" options in the `cypress.json` is set to false, since in the same test it is necessary to log-out and log-in again (e.g. to test an email sent password). Otherwise, a
cross-origin error is fired.

To test locally the email receiving functions set the spring.mail.host address (inside the docker-compose file) to the ip-address of your own machine (on Windows run `ipconfig` from the console).
In case you wish to change the server's port, act similarly and set the same port number inside the /plugins/index.js file.

# Monkey Testing - gremlins.js

Monkey Testing is used to check the robustness of web applications by unleashing a horde of undisciplined gremlins.
Gremlins.js is a monkey testing library written in Javascript for Node.js and the browser.

At the moment we only have dumb monkeys, which try to crash our application with random inputs.
Their attacks are not reproducible, but in the future they will (it's possible).
Finally, we will implement smart monkeys. They have basic information about our application, and will attack defined targets.

## How to start the tests and what is the message of the test results:

Before starting basic monkey tests remove the "ignoreTestFiles"-entry from cypress.json.

Then open cypress and start monkey.local.ts. Now a new window opened und our application is in viewport.

The unleashed gremlins try to crash the application with random inputs.
You will see traces of the gremlins actions on the screen (they leave red traces) and in the console log:

```
gremlin formFiller input 5 in <input type="number" name="age">``
gremlin formFiller input pzdoyzshh0k9@o8cpskdb73nmi.r7r in <input type="email" name="email">
gremlin clicker    click at 1219 301
gremlin scroller   scroll to 100 25
...
```

A horde also contains mogwais, which are harmless gremlins (or, you could say that gremlins are harmful mogwais). Mogwais only monitor the activity of the application and record it on the logger. For
instance, the "fps" mogwai monitors the number of frame per second, every 500ms:

```
mogwai  fps  33.21
mogwai  fps  59.45
mogwai  fps  12.67
...
```

Mogwais also report when gremlins break the application. For instance, if the number of frames per seconds drops below 10, the fps mogwai will log an error:

```
mogwai  fps  12.67
mogwai  fps  23.56
err > mogwai  fps  7.54 < err
mogwai  fps  15.76
...
```

After 10 errors, a special mogwai stops the test. He's called Gizmo, and he prevents gremlins from breaking applications bad. After all, once gremlins have found the first 10 errors, you already know
what you have to do to make your application more robust.

If not stopped by Gizmo, the default horde stops after roughly 1 minute. You can also decrease it on strategies:
`strategies: [strategies.allTogether({ nb: 100000 })]`

If no error messages appears, our application are robust enough.

#### What is missing?

It is not completly finished yet.

- smart gremlins
- executing code before or after attack
- modified mogwais for better reenactment
