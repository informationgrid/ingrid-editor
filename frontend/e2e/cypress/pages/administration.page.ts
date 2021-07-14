import { BasePage, UserAndRights, UserRoles } from './base.page';

export class AdminPage extends BasePage {
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

  static addNewUserRole(roleIndex: UserRoles) {
    cy.get('mat-select').click();
    cy.get('mat-option:nth-child(' + roleIndex + '').click();
  }

  static addNewUserApplyWithoutError() {
    this.applyDialog();
    cy.get('error-dialog').should('not.exist');
  }

  static applyDialog() {
    cy.get('button').contains('Anlegen').click();
    cy.wait(100);
  }

  static toolbarSaveUser() {
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.wait(100);
  }

  static selectUserGroupConnection(groupName: string) {
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('mat-option').contains(groupName).click();
    cy.wait(100);
  }

  static removeUserGroupConnection(groupName: string) {
    cy.get('[data-cy=Gruppen] div.clickable')
      .contains(groupName)
      .trigger('mouseover')
      .parent()
      .find('[data-mat-icon-name=Entfernen]')
      .click({ force: true });
  }

  static addNewGroup(groupname: string) {
    cy.get('mat-toolbar button').contains('Hinzufügen').click();
    cy.get('ige-new-group-dialog').contains('Gruppe hinzufügen').should('be.visible');
    cy.get('ige-new-group-dialog mat-form-field input').click().clear().type(groupname);
    this.applyDialog();
  }
}
