import { BasePage, UserAndRights } from './base.page';
import Chainable = Cypress.Chainable;

export class AdminUserPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('mat-tab-header .mat-tab-label:nth-child(' + tabmenu + '', { timeout: 10000 }).click();
  }

  static addNewUserLogin(login: string) {
    cy.get('ige-new-user-dialog input:first').click({ force: true }).clear().type(login);
  }

  static addNewUserFirstname(firstname: string) {
    cy.get('ige-new-user-dialog formly-field .firstName input').click({ force: true }).clear().type(firstname);
  }

  static addNewUserLastname(lastname: string) {
    cy.get('ige-new-user-dialog formly-field .lastName input').click({ force: true }).clear().type(lastname);
  }

  static addNewUserEmail(email: string) {
    cy.get('ige-new-user-dialog input:last').click({ force: true }).clear().type(email);
  }

  static addNewUserRole(roleTitle: string) {
    cy.get('mat-select').click();
    cy.get('mat-option').contains(roleTitle).click();
  }

  static confirmAddUserDialog() {
    this.applyDialog();
    cy.get('error-dialog').should('not.exist');
  }

  static applyDialog() {
    cy.intercept('POST', '/api/users?newExternalUser=*').as('correctAttempt');
    cy.get('button').contains('Anlegen').click();
    cy.wait('@correctAttempt').its('response.statusCode').should('eq', 200);
  }

  static toolbarSaveUser() {
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.wait(100);
  }

  static addGroupToUser(groupName: string) {
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('mat-option', { timeout: 7000 }).contains(groupName).click();
    cy.wait(100);
  }

  static removeGroupFromUser(groupName: string) {
    cy.get('[data-cy=Gruppen] div.clickable')
      .contains(groupName)
      .trigger('mouseover')
      .parent()
      .parent()
      .find('[data-mat-icon-name="Entfernen"]')
      .click({ force: true });
  }

  static addNewGroup(groupname: string) {
    cy.get('mat-toolbar button').contains('Hinzufügen').click();
    cy.get('ige-new-group-dialog').contains('Gruppe hinzufügen').should('be.visible');
    cy.get('ige-new-group-dialog mat-form-field input').click().clear().type(groupname);
    this.applyDialog();
  }

  static selectUser(name: string) {
    cy.get('user-table').contains(name).click();
    cy.get('#formUser').should('be.visible');
  }

  static checkRoleSymbol(username: string, iconname: string) {
    cy.get('#sidebarUser tr').contains(username).parent().parent().find(iconname).should('be.visible');
  }

  static discardChanges() {
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-discard]').click();
  }

  static cancelChanges() {
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  }

  static getNumberOfUsers(): Chainable<number> {
    return cy
      .get('.user-management-header .page-title')
      .contains(/Nutzer \([0-9]+\)/)
      .then($node => {
        // extract number from string
        return parseInt(
          $node
            .text()
            .split(' ')[2]
            .split('')
            .filter(str => !str.includes('(') && !str.includes(')'))
            .join('')
        );
      });
  }

  static getNumberOfGroups(): Chainable<number> {
    return cy
      .get('.user-management-header .page-title')
      .contains(/Gruppen \([0-9]+\)/)
      .then($node => {
        // extract number from string
        return parseInt(
          $node
            .text()
            .split(' ')[2]
            .split('')
            .filter(str => !str.includes('(') && !str.includes(')'))
            .join('')
        );
      });
  }
}
