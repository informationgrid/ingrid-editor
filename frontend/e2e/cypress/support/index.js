import '@testing-library/cypress/add-commands';
import 'cypress-keycloak-commands';
import './drag-and-drop';
import 'cypress-file-upload';

const addContext = require('mochawesome/addContext');

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    let item = runnable;
    const nameParts = [runnable.title];

    // Iterate through all parents and grab the titles
    while (item.parent) {
      nameParts.unshift(item.parent.title);
      item = item.parent;
    }

    // when an error inside a hook happens then the hook name is part of the screenshot file
    if (runnable.hookName) {
      nameParts.push(`${runnable.hookName} hook`);
    }

    const fullTestName = nameParts
      .filter(Boolean)
      .join(' -- ') // this is how cypress joins the test title fragments
      .replaceAll('#', '%23') // fix encoding for hashtags used for ticket ids
      .replaceAll('"', '') // remove quotations from test name
      .replaceAll('/', ''); // remove slashes from test name

    const firstTestStart = runnable.parent.tests[0].wallClockStartedAt;
    const startTimeOffset = Math.round((test.wallClockStartedAt - firstTestStart) / 1000);
    const currentTime = new Date().toLocaleString('de', { timeZone: 'Europe/Berlin' });
    const startTimeOfIndividualTest = test.wallClockStartedAt;

    addContext({ test }, `assets/${Cypress.spec.name}/${fullTestName} (failed).png`.replace('  ', ' '));
    addContext({ test }, `assets/${Cypress.spec.name}.mp4#t=${startTimeOffset}`);
    addContext(
      { test },
      {
        title: 'test',
        value: test.title
      }
    );
    addContext(
      { test },
      {
        title: 'start of test execution',
        value: new Date(startTimeOfIndividualTest).toLocaleString('de', { timeZone: 'Europe/Berlin' })
      }
    );
    addContext(
      { test },
      {
        title: 'end of test execution',
        value: currentTime
      }
    );
  }
});

Cypress.Commands.add(
  'shouldHaveTrimmedText',
  {
    prevSubject: true
  },
  (subject, equalTo) => {
    if (isNaN(equalTo)) {
      cy.wrap(subject.text().trim()).should('eq', equalTo);
    } else {
      cy.wrap(parseInt(subject.text())).should('eq', equalTo);
    }
    return cy.wrap(subject);
  }
);

Cypress.Commands.add(
  'countShouldBeGreaterThan',
  {
    prevSubject: true
  },
  (subject, greaterThan) => {
    expect(parseInt(subject.text())).to.gt(greaterThan);

    return subject;
  }
);

Cypress.Commands.add('hasErrorDialog', content => {
  cy.get('error-dialog').should('be.visible');

  if (content) {
    cy.get('error-dialog mat-dialog-content').should('contain.text', content);
  }
});

Cypress.Commands.add('fieldIsValid', (fieldClass, content) => {
  cy.get('.' + fieldClass + ' mat-form-field.ng-invalid').should('not.exist');
});

Cypress.Commands.add('fieldIsInvalid', (fieldClass, content) => {
  cy.get('.' + fieldClass + ' mat-form-field.ng-invalid').should('exist');

  if (content) {
    cy.get('.' + fieldClass + ' mat-form-field formly-validation-message').should('contain.text', content);
  }
});

Cypress.Commands.add('containsFormErrors', count => {
  cy.get('.mat-error:not(.invisible)').should('have.length', count);
});
