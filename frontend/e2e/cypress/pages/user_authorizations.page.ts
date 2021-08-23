import { BasePage } from './base.page';
import Chainable = Cypress.Chainable;

export class UserAuthorizationPage extends BasePage {
  static tryChangeFolderwithoutFoldersAccessible() {
    cy.contains('mat-dialog-actions', 'Ordner ändern').click();
    cy.contains('mat-dialog-content', 'Leer');
    cy.get('[data-cy=create-applyLocation]').should('be.disabled');
    cy.contains('[data-cy=create-back]', 'Zurück').click();
  }

  static tryIllegitimateCreate() {
    cy.intercept('POST', '/api/datasets**').as('incorrectAttempt');
    cy.get('[data-cy=create-action]').click();
    cy.wait('@incorrectAttempt').its('response.statusCode').should('eq', 403);
  }

  static closeErrorBox() {
    cy.get('[data-cy=error-dialog-close]').click();
    cy.wait(500);
  }
}
