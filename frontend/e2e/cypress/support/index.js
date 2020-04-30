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
