import { BasePage, UserAndRights } from './base.page';

export class AdminGroupPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('mat-tab-header .mat-tab-label:nth-child(' + tabmenu + '', { timeout: 10000 }).click();
  }

  static applyDialog() {
    cy.get('button').contains('Anlegen').click();
    cy.wait(100);
  }

  static toolbarSaveGroup() {
    cy.get('[data-cy=toolbar_save_group]').click();
    cy.intercept('GET', '/api/groups/**').as('completeEditingRequest');
    cy.wait('@completeEditingRequest');
  }

  static toolbarSaveUser() {
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.intercept('GET', '/api/users/**').as('completeEditingRequest');
    cy.wait('@completeEditingRequest');
  }

  static addNewGroup(groupname: string) {
    cy.get('mat-toolbar button').contains('Hinzufügen').click();
    cy.get('ige-new-group-dialog').contains('Gruppe hinzufügen').should('be.visible');
    cy.get('ige-new-group-dialog mat-form-field input').click().clear().type(groupname);
    this.applyDialog();
  }

  static selectGroup(groupName: string) {
    cy.get('groups-table').contains(groupName).click();
    cy.get('#formRoles').should('be.visible');
  }
}
