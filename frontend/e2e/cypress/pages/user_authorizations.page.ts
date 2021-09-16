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

  static verifyDocumentTitle(title: string) {
    cy.contains('ige-header-title-row', title);
  }

  static changeTitle(title: string) {
    cy.get('.title .label')
      .should('have.class', 'editable')
      .click()
      .get('ige-header-title-row form textarea')
      .type('{selectall}{backspace}')
      .type(title);
    //cy.get('ige-header-title-row form textarea').click().type('{selectall}{backspace}');
  }

  static changeAccessRightFromWriteToRead(objectTitle: string, objectType: string) {
    cy.get('[label="Berechtigungen ' + objectType + '"]')
      .contains(objectTitle)
      .parent()
      .parent()
      .within(() => {
        cy.get('.right-button.active');
        cy.get('.left-button').click();
        cy.get('.left-button.active');
      });
  }

  static changeAccessRightFromReadToWrite(objectTitle: string, objectType: string) {
    cy.get('[label="Berechtigungen ' + objectType + '"]')
      .contains(objectTitle)
      .parent()
      .parent()
      .within(() => {
        cy.get('.left-button.active');
        cy.get('.right-button').click();
        cy.get('.right-button.active');
      });
  }

  static setButtonSubfoldersOnly(objectTitle: string, objectType: string) {
    cy.get('[label="Berechtigungen ' + objectType + '"]')
      .contains(objectTitle)
      .parent()
      .parent()
      .within(() => {
        cy.get('[mattooltip="Nur Unterordner"]').click();
      });
  }

  static ProfileElements: Record<string, string> = {
    Title: '.page-title.left-side',
    Role: 'div.side-item:nth-child(2)',
    Groups: 'div.side-item:nth-child(1)',
    FirstName: 'div.info-row:nth-child(2) > div:nth-child(2)',
    LastName: 'div.info-row:nth-child(3) > div:nth-child(2)',
    Email: 'div.info-row:nth-child(5) > div:nth-child(2)',
    Password: 'div.info-row:nth-child(7) > div:nth-child(2)'
  };
}
