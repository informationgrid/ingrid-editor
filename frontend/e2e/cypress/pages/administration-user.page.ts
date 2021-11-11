import { BasePage, UserAndRights } from './base.page';
import Chainable = Cypress.Chainable;

export class AdminUserPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('a.mat-tab-link[href="' + tabmenu + '"]', { timeout: 10000 }).click();
  }

  static visit() {
    cy.intercept('GET', '/api/users').as('usersCall');
    cy.visit('manage/user');
    cy.wait('@usersCall');
    cy.get('.page-title').contains('Nutzer');
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

  static attemptIllegitimateApplyDialog() {
    cy.intercept('POST', '/api/users?newExternalUser=*').as('failingAttempt');
    cy.get('button').contains('Anlegen').click();
    cy.wait('@failingAttempt').its('response.statusCode').should('eq', 409);
  }

  static attemptIllegitimateMove() {
    cy.intercept('POST', '**/move').as('failingAttempt');
    cy.get('button').contains('Verschieben').click();
    cy.wait('@failingAttempt').its('response.statusCode').should('eq', 403);
  }

  static toolbarSaveUser() {
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.wait(100);
  }

  static addGroupToUser(groupName: string) {
    cy.get('[data-cy=Gruppen] .mat-select-arrow').click({ force: true });
    cy.contains('mat-option', groupName).click();
  }

  static removeGroupFromUser(groupName: string) {
    cy.contains('[data-cy=Gruppen] div.clickable', groupName)
      .should('be.visible')
      .trigger('mouseover')
      /*.parent()
      .parent()*/
      .find('[data-mat-icon-name="Entfernen"]')
      .click({ force: true });
  }

  static deleteUser() {
    cy.get('#formUser [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content').contains('löschen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-ok]').click();
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
    // sometimes further selecting goes wrong because dom is not ready -> add some time
    cy.wait(1000);
  }

  static changeManager(name: string) {
    cy.get('#formUser [data-mat-icon-name=Mehr]').click();
    cy.get('.mat-menu-content').children().first().click();
    cy.get('ige-edit-manager-dialog').find('.mat-select-arrow').click();
    cy.get('[role="listbox"]').should('be.visible').contains('mat-option', name).click();
    cy.intercept('GET', /api\/users\//).as('setManager');
    cy.contains('.mat-button-wrapper', 'Zuweisen').click();
    cy.wait('@setManager').its('response.body.manager').should('eq', name);
  }

  static cedeResponsibility(manager?: string) {
    cy.get('#formUser [data-mat-icon-name=Mehr]').click();
    cy.get('.mat-menu-content').children().eq(1).click();
    if (manager === undefined) {
      return;
    }
    // when parameter manager is there, the action is not expected to fail
    cy.contains('mat-dialog-container', 'Der Benutzer ist aktuell für folgende Nutzer verantwortlich');
    cy.contains('button', 'Verantwortlichen auswählen').click();
    cy.intercept('GET', '/api/users/admins').as('getAdmins');
    // arrow-select menu needs time to be able to be expanded:
    cy.wait(1000);
    cy.get('mat-dialog-container .mat-select-arrow').trigger('mouseover').click({ force: true });
    //cy.get('mat-dialog-container .mat-select-arrow').click({ force: true });
    cy.wait('@getAdmins');
    cy.contains('[role="listbox"] mat-option', manager, { timeout: 10000 }).click();
    cy.intercept('POST', '/api/users/' + '*' + '/manager' + '*').as('waitForSelection');
    cy.contains('mat-dialog-container button', 'Zuweisen').click();
    cy.wait('@waitForSelection');
  }

  static closeBox() {
    cy.get('mat-dialog-container').find('button').eq(1).click();
  }

  static verifyInfoInHeader(key: keysInHeader, value: string) {
    // open up header
    cy.get('.user-title .menu-button').eq(0).click();
    // verify information
    cy.get('.more-info div[fxlayout="row"]:nth-child(' + key + ')').within(() => {
      cy.get('div').eq(1).should('have.text', value);
    });
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

  static createNewUser(userLogIn: string, userEmail: string, userRole: string) {
    // create user
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin(userLogIn);
    AdminUserPage.addNewUserFirstname(userLogIn);
    AdminUserPage.addNewUserLastname(userLogIn);
    AdminUserPage.addNewUserEmail(userEmail);
    AdminUserPage.addNewUserRole(userRole);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.confirmAddUserDialog();
  }
}

export enum keysInHeader {
  LastLogin = 1,
  CreationDate,
  EditDate,
  Login,
  Manager
}
