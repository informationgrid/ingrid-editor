import { BasePage, UserAndRights, UserRoles } from './base.page';

export class AdminPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('mat-tab-header .mat-tab-label:nth-child(' + tabmenu + '', { timeout: 10000 }).click();
  }

  static addNewUserLogin(login: string) {
    cy.get('ige-new-user-dialog input:first').type(login);
  }

  static addNewUserFirstname(firstname: string) {
    cy.get('ige-new-user-dialog formly-field .firstName').type(firstname);
  }

  static addNewUserLastname(lastname: string) {
    cy.get('ige-new-user-dialog formly-field .lastName').type(lastname);
  }

  static addNewUserEmail(email: string) {
    cy.get('ige-new-user-dialog input:last').type(email);
  }

  static addNewUserRole(roleIndex: UserRoles) {
    cy.get('mat-select').click();
    cy.get('mat-option:nth-child(' + roleIndex + '').click();
  }

  static addNewUserApplyWithoutError() {
    this.addNewUserClickSave();
    cy.get('error-dialog').should('not.exist');
  }

  static addNewUserClickSave() {
    cy.get('button').contains('Anlegen').click();
    cy.wait(100);
  }

  static toolbarSaveUser() {
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.wait(100);
  }
}
