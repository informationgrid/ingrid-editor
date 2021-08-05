import { AdminUserPage } from '../../pages/administration-user.page';
import { DocumentPage } from '../../pages/document.page';
import { UserAndRights } from '../../pages/base.page';
import { catchError } from 'rxjs/operators';

describe('User', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
    cy.get('.page-title').contains('Nutzer');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should create a new user', () => {
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin('loginZ');
    AdminUserPage.addNewUserFirstname('Son');
    AdminUserPage.addNewUserLastname('Goku');

    // check "OK"-button not clickable, when not all mandatory fields are filled
    cy.get('button').contains('Anlegen').parent().should('have.class', 'mat-button-disabled');

    // all mandatory fields must be filled
    AdminUserPage.addNewUserEmail('test@wemove.com');
    AdminUserPage.addNewUserRole('Katalog-Administrator');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');

    AdminUserPage.confirmAddUserDialog();
  });

  it('the correct role symbol should be in user list', () => {
    const username = 'Majid Ercan';

    AdminUserPage.selectUser(username);
    AdminUserPage.checkRoleSymbol(username, '[data-mat-icon-name=catalog-admin]');

    // check same symbol is also in #formUser visible
    cy.get('#formUser [data-mat-icon-name=catalog-admin]').should('be.visible');
  });

  it('should be possible to rename user', () => {
    const firstname = 'Meta';
    const modified = 'Mario';

    AdminUserPage.selectUser(firstname);

    // modify name of a user
    cy.get('[data-cy=Name] .firstName').click().clear().type(modified);
    AdminUserPage.toolbarSaveUser();

    // check modified entries were saved
    cy.get('user-table').should('not.contain', 'Meta Admin');
    cy.get('user-table').should('contain', modified);

    // reverse changes
    AdminUserPage.selectUser(modified);

    cy.get('[data-cy=Name] .firstName').click().clear().type(firstname);
    AdminUserPage.toolbarSaveUser();

    // check changes were returned
    cy.get('user-table').should('contain', 'Meta Admin');
    cy.get('user-table').should('not.contain', modified);
  });

  it('should not be possible to empty a mandatory field and save (#2595)', () => {
    AdminUserPage.selectUser('Majid Ercan');

    cy.get('[data-cy=E-Mail]  formly-field-mat-input').click().clear();
    // clicking another field is needed to activate the error-message
    cy.get('[data-cy=Name] .firstName').click().clear();
    cy.get('mat-error').should('have.length', 1);
    cy.get('[data-cy=Name] .lastName').click().clear();
    cy.get('mat-error').should('have.length', 2);
    // clicking another field is needed to activate the error-message
    cy.get('[data-cy=E-Mail]  formly-field-mat-input').click();
    cy.get('mat-error').should('have.length', 3);

    cy.get('mat-error').contains('Dieses Feld muss ausgefüllt sein').should('be.visible');
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');
  });

  it('when changes on user entries were not saved, discard dialog must appear (#2675)', () => {
    const username = 'Meins Deins';
    const newEntry = 'Majid';
    const modifiedName = 'Tralala';

    AdminUserPage.selectUser(username);

    // after cancel, we are still in edit mode
    cy.get('[data-cy=Name] .firstName').click().clear().type(modifiedName);
    cy.get('user-table').contains(newEntry).click();
    AdminUserPage.cancelChanges();

    // check firstname-Entry is not changed to the value before
    cy.get('[data-cy=Name] .firstName').invoke('text').should('not.equal', 'Meins');
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');

    // check right and same user is clicked on user-list and #formUser
    // 'eins' is the login of user 'Meins Deins'
    cy.get('.user-title').contains('eins');
    cy.get('user-table .selected').contains('eins');

    // after discard, all unsaved entries were undone
    cy.get('user-table').contains(newEntry).click();
    AdminUserPage.discardChanges();

    AdminUserPage.selectUser(username);
    cy.get('[data-cy=Name] .firstName').contains('Meins');
    cy.get('[data-cy=Name] .lastName').contains('Deins');
  });

  it('after discard dialog appears no other dialog may appear after it (#2574)', () => {
    const username = 'Meins Deins';
    const newEntry = 'Tristan';

    // change something (name) and try to click on anthother user --> discard dialog appears
    AdminUserPage.selectUser(username);

    // adapt user entry and click on 'Hinzufügen'- button --> discard dialog must appear --> decline
    cy.get('[data-cy=Name] .firstName').click().clear().type(newEntry);
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.cancelChanges();
    // new user dialog may not appear
    cy.get('ige-new-user-dialog').should('not.exist');

    // click on other tabmenu --> discard dialog must appear --> decline
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminUserPage.cancelChanges();
  });

  it('should not be possible to change menupage without appearing discard dialog (#2619)', () => {
    const newEntry = 'Tralala';
    const username = 'Meins Deins';

    // change something (name) and try to click on anthother user --> discard dialog appears
    AdminUserPage.selectUser(username);

    // adapt user entry
    cy.get('[data-cy=Name] .firstName').click().clear().type(newEntry);

    // click on other menu page --> discard dialog must appear --> decline
    cy.get(DocumentPage.Sidemenu.Adressen).click();
    AdminUserPage.cancelChanges();
  });

  it('should not possible to have equal logins', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin('ige');
    AdminUserPage.addNewUserFirstname('Son');
    AdminUserPage.addNewUserLastname('Goku');
    AdminUserPage.addNewUserEmail('test@wemove.com');
    AdminUserPage.addNewUserRole('Katalog-Administrator');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.applyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    cy.get('[data-cy=error-dialog-content]').contains('Es existiert bereits ein Benutzer mit dem Login: ige');
  });

  it('should not possible to have equal email addresses', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin('logingt');
    AdminUserPage.addNewUserFirstname('Son');
    AdminUserPage.addNewUserLastname('Goten');
    AdminUserPage.addNewUserEmail('me@wemove.com');
    AdminUserPage.addNewUserRole('Autor');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.applyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    cy.get('[data-cy=error-dialog-content]').contains('Es existiert bereits ein Benutzer mit dieser Mailadresse');
  });

  it('should not possible to change login or role after user is created', () => {
    const username = 'Meins Deins';
    const username2 = 'Meta Admin';
    const username3 = 'toDelete inTest';

    //Katalog-Admin
    AdminUserPage.selectUser(username);
    cy.get('[data-cy=Login]').should('not.be.enabled');
    cy.get('[data-cy=Rolle]').should('not.be.enabled');

    //Meta-Admin
    AdminUserPage.selectUser(username2);
    cy.get('[data-cy=Login]').should('not.be.enabled');
    cy.get('[data-cy=Rolle]').should('not.be.enabled');

    //Autor
    AdminUserPage.selectUser(username3);
    cy.get('[data-cy=Login]').should('not.be.enabled');
    cy.get('[data-cy=Rolle]').should('not.be.enabled');
  });

  it('organisation name must be shown at user list view', () => {
    const username = 'Majid Ercan';

    AdminUserPage.selectUser(username);

    cy.get('#sidebarUser tr').contains('wemove digital solutions');
  });

  it('show login- and creation information', () => {
    const loginEntry = 'meta';
    const username = 'Meta Admin';

    AdminUserPage.selectUser(username);

    // check fields "Zuletzt eingeloggt", "Erstellt am", "Geändert am" and ID/login
    cy.get('.user-title [data-mat-icon-type=font]').click();
    cy.get('.more-info').should('be.visible');
    cy.get('.more-info').contains('Zuletzt eingeloggt');
    cy.get('.more-info').contains('Erstellt am');
    cy.get('.more-info').contains('Geändert am');
    cy.get('.more-info').contains('Verantwortlich');
    cy.get('.more-info').contains(loginEntry);

    // compare the entry in ID/login with the Login- field
    cy.get('.user-title').contains(loginEntry);
  });

  it('should be possible to delete a user', () => {
    const toDelete = 'toDelete inTest';

    AdminUserPage.selectUser(toDelete);
    cy.get('#formUser [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content').contains('löschen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-ok]').click();

    cy.get('user-table').should('not.contain', toDelete);
  });

  it('only names, emails, logins or organisations can be user search results (#2551)', () => {
    cy.get('user-table').should('contain', 'Meins');
    cy.get('user-table').should('contain', 'Majid');

    cy.get('ige-search-field').type('Meins');
    cy.get('user-table').should('not.contain', 'Majid');
    cy.get('user-table').should('contain', 'Meins');

    cy.get('ige-search-field').clear().type('Deins');
    cy.get('user-table').should('not.contain', 'Ercan');
    cy.get('user-table').should('contain', 'Deins');

    cy.get('ige-search-field').clear().type('me@wemove.com');
    cy.get('user-table').should('not.contain', 'majid.ercan@wemove.com');
    cy.get('user-table').should('contain', 'me@wemove.com');

    cy.get('ige-search-field').clear().type('wemove digital solutions');
    cy.get('user-table').should('not.contain', 'Meins');
    cy.get('user-table').should('contain', 'wemove digital solutions');

    cy.get('ige-search-field').clear().type('ige2');
    cy.get('user-table').should('not.contain', 'eins');
    cy.get('user-table').should('contain', 'ige2');
  });

  it('a user can be found with his first- and lastname (#2596)', () => {
    cy.get('ige-search-field').type('Meins Deins');
    cy.get('user-table').should('not.contain', 'Majid');

    cy.get('user-table').should('contain', 'Meins Deins');
  });

  it('selected user must be active and all informations of it must be shown (#2551)', () => {
    const username = 'Meta Admin';
    const username2 = 'Meins Deins';
    const username3 = 'autor test';

    // meta-admin
    AdminUserPage.selectUser(username);
    // check user was selected
    cy.get('td.selected').contains(username);
    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
    // check user role
    AdminUserPage.checkRoleSymbol(username, '[data-mat-icon-name=meta-admin]');

    //catalog-admin
    AdminUserPage.selectUser(username2);
    // check user was selected
    cy.get('td.selected').contains(username2);
    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
    // check user role
    AdminUserPage.checkRoleSymbol(username2, '[data-mat-icon-name=catalog-admin]');

    //authtor
    AdminUserPage.selectUser(username3);
    // check user was selected
    cy.get('td.selected').contains(username3);
    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
    // check user role
    AdminUserPage.checkRoleSymbol(username3, '[data-mat-icon-name=author]');
  });

  it('should be possible to add and remove a group (or different groups) to an user', () => {
    const groupName = 'Gruppe 42';
    const groupName2 = 'Testgruppe';
    const username = 'Meins Deins';

    AdminUserPage.selectUser(username);

    // check no group connected
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);

    // select group and save
    AdminUserPage.addGroupToUser(groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName);
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName2);

    AdminUserPage.addGroupToUser(groupName2);
    AdminUserPage.toolbarSaveUser();

    // check groups were connected
    cy.get('[data-cy=Gruppen]').should('contain', groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName2);

    // remove group-connection from user
    AdminUserPage.removeGroupFromUser(groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName2);
    AdminUserPage.removeGroupFromUser(groupName2);
    AdminUserPage.toolbarSaveUser();

    // check groups are not connected anymore
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName2);
  });

  it('should not be possible to add the same group twice to one user', () => {
    const username = 'Meins Deins';
    const groupName = 'Testgruppe';

    AdminUserPage.selectUser(username);

    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
    AdminUserPage.addGroupToUser(groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName);

    // check if 'Testgruppe' is not selectable a second time
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('.mat-option-disabled').should('contain', groupName);
  });

  //TODO: Verification emails for user!
});
