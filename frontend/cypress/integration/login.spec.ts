///<reference path="../../node_modules/cypress/types/index.d.ts"/>
describe('Login', () => {
  beforeEach(() => {
  });

  it('should show the login page to begin with', () => {
    cy.visit('');
    cy.get('mat-card-title').should('contain', 'Login');
    cy.get('[data-test=login]').should('contain', 'Login');
  });

});
