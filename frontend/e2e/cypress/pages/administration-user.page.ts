import { BasePage, UserAndRights } from './base.page';
import { DashboardPage } from './dashboard.page';
import Chainable = Cypress.Chainable;

export interface UserFormData {
  login: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  groups: string[];
}

export class AdminUserPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('a.mat-tab-link[href="' + tabmenu + '"]', { timeout: 10000 }).click();
  }

  static visit() {
    cy.intercept('GET', '/api/users').as('usersCall');
    cy.intercept('GET', '/api/groups').as('groups');
    cy.visit('manage/user');
    cy.wait('@usersCall', { timeout: 9000 });
    cy.wait('@groups', { timeout: 9000 });
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
    cy.get('ige-new-user-dialog mat-select').click();
    cy.get('mat-option').contains(roleTitle).click();
  }

  static addNewUser(data: Partial<UserFormData>, save = true) {
    if (data.firstName) {
      this.addNewUserFirstname(data.firstName);
    }
    if (data.lastName) {
      this.addNewUserLastname(data.lastName);
    }

    if (data.login) {
      this.addNewUserLogin(data.login);
    }

    if (data.email) {
      this.addNewUserEmail(data.email);
    }
    if (data.role) {
      this.addNewUserRole(data.role);
    }

    if (save) {
      AdminUserPage.confirmAddUserDialog();
      this.userShouldExist(data.email!);
    }
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

  static saveUser() {
    cy.intercept('PUT', '/api/users/*').as('saveUser');
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.wait('@saveUser');
  }

  static updateUser(data: Partial<UserFormData>, save = true) {
    if (data.firstName) {
      cy.get('[data-cy=Name] .firstName input').clear().type(data.firstName);
    }
    if (data.email) {
      cy.get('[data-cy=E-Mail]  formly-field-mat-input input').clear().type(data.email);
    }

    if (save) {
      AdminUserPage.saveUser();
    }
  }

  static addGroupToUser(groupName: string) {
    // TODO: remove wait when we find another way to wait for field to be initialized
    cy.wait(200);
    cy.get('[data-cy=Gruppen] .mat-select-arrow').click({ force: true });
    cy.get(this.groupSelectionField, { timeout: 10000 }).should('be.visible');
    cy.contains('mat-option', groupName).click();
    cy.contains('ige-repeat-list', groupName, { timeout: 6000 });
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

  static groupSelectionField = '.mat-select-panel-wrap';

  // TODO: select user by unique property like email!
  static selectUser(name: string) {
    cy.get('.page-title').contains('Nutzer (');
    cy.get('[data-cy=search]').clear({ force: true }).type(name);
    cy.contains('user-table .mat-row', name).click();
    cy.get('#formUser').should('be.visible');
  }

  static clearSearch() {
    cy.get('[data-cy=search]').clear({ force: true });
  }

  static userShouldNotExist(email: string) {
    cy.get('[data-cy=search]').clear({ force: true }).type(email);
    cy.get('user-table .mat-row').should('have.length', 0);
  }

  static userShouldExist(email: string) {
    cy.get('[data-cy=search]').clear({ force: true }).type(email);
    cy.get('user-table .mat-row').should('have.length', 1);
  }

  static selectAssociatedUser(name: string) {
    cy.contains('user-table tbody tr', name).click();
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
    cy.get('mat-dialog-container').should('not.exist');
  }

  static cancelChanges() {
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  }

  static getNextPage() {
    cy.get('.mat-paginator-navigation-next').click();
    cy.wait(100);
  }

  static changeUserRole(newRole: string, confirm: boolean = false) {
    cy.get('[data-cy="Rolle"]').click();
    cy.get('mat-option').contains(newRole).click();
    if (confirm) {
      this.saveUser();
    }
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
  /**
   * Check whether a user can see and access to other users with specific role
   * shouldContain is a boolean to check if the role should be included in the list of users or not
   */
  static checkContainsUserRole(role: string, shouldContain: boolean = false) {
    if (shouldContain) {
      let found = false;
      cy.get('user-table table mat-icon')
        .each(($el, index, $list) => {
          if ($el.attr('data-mat-icon-name') == role) {
            found = true;
          }
        })
        .then($lis => {
          expect(found).to.equal(true);
        });
    } else {
      cy.get('user-table table mat-icon').each(($el, index, $list) => {
        cy.wrap($el).invoke('attr', 'data-mat-icon-name').should('not.eq', role);
      });
    }
  }

  static checkForEmptyGroupDropdown() {
    // if the dropdown contains no group, then the first child
    // should be the MAT-FORM-FIELD that represents the dropdown
    cy.get('[data-cy=Gruppen] ')
      .get('ige-repeat-list')
      .children()
      .eq(0)
      .should('have.prop', 'tagName')
      .should('eq', 'MAT-FORM-FIELD');
  }

  static extractAndResetNewUserPassword(userLogIn: string, userEmail: string, userRole: string) {
    //Here we want to wait after user creation to get the email
    //Because it takes some time to receive welcoming email
    //we are unable to intercept the call, so we added random wait time
    cy.wait(5000);
    // get email and extract the password
    cy.task('getLastEmail', userEmail)
      .its('body')
      .then(body => {
        expect(body).to.contain('Herzlich Willkommen beim IGE-NG');

        // Extract the password
        let bodyArray = body.split('Ihr Passwort für den IGE-NG lautet:');
        let psw = bodyArray[1].split('\n')[0].trim();

        cy.kcLogout();

        // Here we have to reload otherwise the because logout does not redirect to login page
        cy.reload();
        cy.get('.title', { timeout: 20000 }).should('contain', 'InGrid');

        cy.get('#username').type(userLogIn);
        cy.get('#password').type(psw);
        cy.get('#kc-login').click();
        cy.wait(1000);

        cy.get('#kc-content-wrapper').should('contain', 'Sie müssen Ihr Passwort ändern,');

        // login and check for the user name
        cy.get('#password-new').type(userLogIn);
        cy.get('#password-confirm').type(userLogIn);
        cy.intercept('GET', 'api/info/currentUser').as('getUser');
        cy.get('#kc-login').click();
        cy.wait('@getUser');
        if (userRole != 'Autor') {
          DashboardPage.visit();
        }
        cy.get('.welcome').contains('Willkommen');
        cy.get('[data-cy="header-profile-button"]').click();
        cy.get('.mat-card-title').contains(userLogIn + ' ' + userLogIn);
      });
  }
}

export enum keysInHeader {
  LastLogin = 1,
  CreationDate,
  EditDate,
  Login,
  Manager
}
