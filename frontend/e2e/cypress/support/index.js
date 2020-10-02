import '@testing-library/cypress/add-commands';
import "cypress-keycloak-commands";
import "./drag-and-drop";

const addContext = require('mochawesome/addContext');

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {

    let item = runnable
    const nameParts = [runnable.title]

    // Iterate through all parents and grab the titles
    while (item.parent) {
      nameParts.unshift(item.parent.title)
      item = item.parent
    }

    const fullTestName = nameParts
      .filter(Boolean)
      .join(' -- ')           // this is how cypress joins the test title fragments

    addContext({test}, `assets/${Cypress.spec.name}/${fullTestName} (failed).png`);
    addContext({test}, `assets/${Cypress.spec.name}.mp4`);
  }
});

Cypress.Commands.add(
  'shouldHaveTrimmedText',
  {
    prevSubject: true,
  },
  (subject, equalTo) => {
    if (isNaN(equalTo)) {
      expect(subject.text().trim()).to.eq(equalTo);
    } else {
      expect(parseInt(subject.text())).to.eq(equalTo);
    }
    return subject;
  },
);

Cypress.Commands.add('hasErrorDialog', (content) => {
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
    cy.get('.' + fieldClass + ' mat-form-field formly-validation-message')
      .should('contain.text', content);
  }
});
