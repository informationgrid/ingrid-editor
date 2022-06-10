// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
const ms = require('smtp-tester');

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // email configuration
  const port = 25;
  const mailServer = ms.init(port);

  console.log('Mail server started at port %d', port);

  let lastEmail = {};

  // process all emails
  mailServer.bind((addr, id, email) => {
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
};
