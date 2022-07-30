import { defineConfig } from 'cypress';
const ms = require('smtp-tester');

function setupMail(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // email configuration
  const port = 25;
  const mailServer = ms.init(port);

  console.log('Mail server started at port %d', port);

  let lastEmail: any = {};

  // process all emails
  mailServer.bind((addr: any, id: any, email: any) => {
    console.log('--- email to %s ---', email.headers.to);
    console.log(email.body);
    console.log('--- end ---');

    // store the email by the receiver email
    lastEmail[email.headers.to] = {
      body: email.body,
      html: email.html
    };
  });

  on('task', {
    // clean email inbox
    resetEmails(email) {
      if (email) {
        delete lastEmail[email];
      } else {
        lastEmail = {};
      }
      return null;
    },

    getLastEmail(userEmail) {
      // cy.task cannot return undefined
      // thus we return null as a fallback
      return lastEmail[userEmail] || null;
    }
  });
}

export default defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: './cypress/mochawesome-reports',
    files: ['./cypress/mochawesome-reports'],

    overwrite: false,
    html: false,
    json: true,
    timestamp: 'yyyymmdd_HHMMss'
  },
  env: {
    auth_base_url: 'http://192.168.0.228:8080',
    auth_realm: 'InGrid',
    auth_client_id: 'ige-ng-frontend'
  },
  screenshotsFolder: 'cypress/mochawesome-reports/assets',
  videosFolder: 'cypress/mochawesome-reports/assets',
  video: true,
  videoUploadOnPasses: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  videoCompression: 32,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      setupMail(on, config);
    },
    baseUrl: 'http://192.168.0.228',
    excludeSpecPattern: '**/*.local.cy.ts'
  }
});
