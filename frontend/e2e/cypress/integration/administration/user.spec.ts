import { AdminUserPage, keysInHeader } from '../../pages/administration-user.page';
import { DocumentPage } from '../../pages/document.page';
import { UserAndRights } from '../../pages/base.page';
import { ResearchPage, SearchOptionTabs } from '../../pages/research.page';
import { AddressPage } from '../../pages/address.page';
import { DashboardPage } from '../../pages/dashboard.page';

describe('User', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user', { timeout: 30000, retryOnStatusCodeFailure: true })
      .document()
      .its('contentType')
      .then(function (res) {
        if (res != 'text/html') cy.visit('user');
      });
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

    // check "OK"-button not clickable, when mandatory fields are not filled
    cy.get('button').contains('Anlegen').parent().should('have.class', 'mat-button-disabled');

    // all mandatory fields must be filled
    AdminUserPage.addNewUserEmail('test@wemove.com');
    AdminUserPage.addNewUserRole('Katalog-Administrator');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');

    AdminUserPage.confirmAddUserDialog();
  });

  it('should display the correct role symbol in the user list', () => {
    const username = 'Majid Ercan';

    AdminUserPage.selectUser(username);
    AdminUserPage.checkRoleSymbol(username, '[data-mat-icon-name=catalog-admin]');

    // check same symbol is also in #formUser visible
    cy.get('#formUser [data-mat-icon-name=catalog-admin]').should('be.visible');
  });

  it('should be possible to rename a user', () => {
    const firstname = 'Meta';
    const fullName = 'Meta Admin';
    const modifiedFullName = 'Mario Admin';
    const modified = 'Mario';

    AdminUserPage.selectUser(fullName);
    // modify name of a user
    cy.get('[data-cy=Name] .firstName').click().clear().type(modified);
    AdminUserPage.toolbarSaveUser();

    // check modified entries were saved
    cy.get('user-table').should('not.contain', 'Meta Admin');
    cy.get('user-table').should('contain', modified);

    // reverse changes
    AdminUserPage.selectUser(modifiedFullName);

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

  it('should display the discard dialog, when changes on user entries are not saved (#2675)', () => {
    const UserLogin = 'eins';

    AdminUserPage.selectUser('Meins Deins');
    // change name, then interrupt editing by trying to switch to another user
    // after canceling the prompt to discard changes, we are still in editing mode
    cy.get('.firstName').click().clear().type('Tralala');
    cy.get('user-table').contains('Majid').click();
    AdminUserPage.cancelChanges();
    // check that firstname-Entry is not changed to the original value and that user is still selected
    cy.get('.firstName input').should('not.have.value', 'Meins');
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
    cy.get('.user-title').contains(UserLogin);
    //wait for new user being selected is reversed (no network request involved to intercept)
    cy.wait(2000);
    cy.get('user-table .selected').contains(UserLogin);

    // try to switch to another user, this time discarding all changes -> changes are undone, new user can be selected
    cy.get('user-table').contains('Majid').click();
    AdminUserPage.discardChanges();
    cy.intercept('GET', '/api/users/ige2').as('fetchInformationRequest');
    // wait for the request that prepares switching to new user
    cy.wait('@fetchInformationRequest');

    // go back to original user profile and make sure data is unchanged
    AdminUserPage.selectUser('Meins Deins');
    cy.get('.firstName input').should('have.value', 'Meins');
    cy.get('.lastName input').should('have.value', 'Deins');
  });

  it('should not display any dialog after the discard dialog has appeared (#2574)', () => {
    const username = 'Meins Deins';
    const newEntry = 'Tristan';

    // change something (name) and try to click on another user --> discard dialog appears
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

  it('should display the discard dialog when the menu-page is changed with unsaved changes (#2619)', () => {
    const newEntry = 'Tralala';
    const username = 'Meins Deins';

    // change something and try to click on another user --> discard dialog appears
    AdminUserPage.selectUser(username);

    // adapt user entry
    cy.get('[data-cy=Name] .firstName').click().clear().type(newEntry);

    // click on other menu page --> discard dialog must appear --> decline
    cy.get(DocumentPage.Sidemenu.Adressen).click();
    AdminUserPage.cancelChanges();
  });

  it('should not be possible for two users to have equal logins', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin('ige');
    AdminUserPage.addNewUserFirstname('Son');
    AdminUserPage.addNewUserLastname('Goku');
    AdminUserPage.addNewUserEmail('test@wemove.com');
    AdminUserPage.addNewUserRole('Katalog-Administrator');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.attemptIllegitimateApplyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    cy.get('[data-cy=error-dialog-content]').contains('Es existiert bereits ein Benutzer mit dem Login: ige');
  });

  it('should not be possible for two users to have equal email addresses', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin('logingt');
    AdminUserPage.addNewUserFirstname('Son');
    AdminUserPage.addNewUserLastname('Goten');
    AdminUserPage.addNewUserEmail('me@wemove.com');
    AdminUserPage.addNewUserRole('Autor');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.attemptIllegitimateApplyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    cy.get('[data-cy=error-dialog-content]').contains('Es existiert bereits ein Benutzer mit dieser Mailadresse');
  });

  it('should not be possible to change the login or the role after a user is created', () => {
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

  it('should display the organisation name in the user list view', () => {
    const username = 'Majid Ercan';

    AdminUserPage.selectUser(username);

    cy.get('#sidebarUser tr').contains('wemove digital solutions');
  });

  it('should show login and creation information', () => {
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
    cy.get('.user-title').contains(username);
  });

  it('should be possible to delete a user', () => {
    const toDelete = 'toDelete inTest';
    AdminUserPage.selectUser(toDelete);
    AdminUserPage.deleteUser();
    cy.get('user-table').should('not.contain', toDelete);
  });

  it('should show only the names, emails, logins and organisations as result of a user search (#2551)', () => {
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

  it('should find a user using her first- and lastname as search terms (#2596)', () => {
    cy.get('ige-search-field').type('Meins Deins');
    cy.get('user-table').should('not.contain', 'Majid');

    cy.get('user-table').should('contain', 'Meins Deins');
  });

  it('should display all information of a selected user and mark her as active (#2551)', () => {
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

    //author
    AdminUserPage.selectUser(username3);
    // check user was selected
    cy.get('td.selected').contains(username3);
    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
    // check user role
    AdminUserPage.checkRoleSymbol(username3, '[data-mat-icon-name=author]');
  });

  it('should add and remove one or more groups to a user', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'gruppe_mit_datenrechten';
    const username = 'autor test';

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
    AdminUserPage.toolbarSaveUser();
    cy.get('[data-cy=Gruppen]').should('contain', groupName2);
    AdminUserPage.removeGroupFromUser(groupName2);
    AdminUserPage.toolbarSaveUser();

    // check groups are not connected anymore
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName2);
  });

  it('should not be able to add the same group twice to a user (#3047)', () => {
    const username = 'autor test';
    const groupName = 'test_gruppe_1';

    // I. make sure that same group cannot be added twice consecutively
    AdminUserPage.selectUser(username);

    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
    AdminUserPage.addGroupToUser(groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName);

    //sometimes '[data-cy=Gruppen] mat-select' is hidden because the list from the previous adding group action
    // is still expanded; therefore the additional wait
    cy.wait(500);

    // check if 'Testgruppe' is not selectable a second time
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('.mat-option-disabled').should('contain', groupName);

    // II. make sure that a group can not be added when the same group is already assigned to user
    // (force-option is necessary because on the previous user profile a menu is still expanded)
    cy.get('user-table').contains('Test Verantwortlicher2').click({ force: true });
    AdminUserPage.discardChanges();
    cy.get('[data-cy=Gruppen]').should('contain', 'gruppe_mit_ortsrechten');
    // check if 'gruppe_mit_ortsrechten' is not selectable
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('.mat-option-disabled').should('contain', 'gruppe_mit_ortsrechten');
  });

  it('should enable save button, when a user`s entries have changed (#2569)', () => {
    const username = 'Meins Deins';
    const modified = 'Vorname';

    AdminUserPage.selectUser(username);
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');

    cy.get('[data-cy=Name] .firstName').click().clear().type(modified);
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
  });

  it('should not be possible to click on another object, while the discard dialog is open (#2569)', () => {
    const username = 'Meins Deins';
    const username2 = 'Meta Admin';
    const modified = 'Vorname';

    AdminUserPage.selectUser(username);
    cy.get('[data-cy=Name] .firstName').click().clear().type(modified);

    AdminUserPage.selectUser(username2);
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');

    // when overlay is findable, other entries are not clickable
    cy.get('mat-dialog-container').parent().parent().parent().find('.cdk-overlay-dark-backdrop');
  });

  it('should not leave the page after changes are canceled and the changes are not saved by discarding (#2569)', () => {
    const username = 'Meins Deins';
    const username2 = 'Meta Admin';
    const modified = 'Vorname';

    AdminUserPage.selectUser(username);
    cy.get('[data-cy=Name] .firstName').click().clear().type(modified);
    AdminUserPage.selectUser(username2);

    // when save-button is disabled all changes are reverted
    AdminUserPage.discardChanges();
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');
    cy.get('[data-cy=Name] .firstName').click().clear().type(modified);
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');

    // when changes are canceled, save-button is enabled
    AdminUserPage.selectUser(username);
    AdminUserPage.cancelChanges();
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
    cy.get('.user-title').contains(modified + ' ' + 'Admin');
  });

  it('should be possible to change manager of a user', () => {
    const login = 'drei';
    const managerName = 'Test Verantwortlicher';
    cy.visit('user');
    AdminUserPage.selectUser('autor test');
    AdminUserPage.changeManager(login);
    AdminUserPage.verifyInfoInHeader(keysInHeader.Manager, managerName);
  });

  it('should not be possible to take responsibility from a user without responsibility', () => {
    // go to user
    cy.visit('user');
    AdminUserPage.selectUser('autor2');
    // try to execute action "Verantwortung abgeben"
    AdminUserPage.cedeResponsibility();
    // expect error
    cy.contains('mat-dialog-container', 'Der ausgewählte Benutzer ist für keine anderen Nutzer verantwortlich');
  });

  xit('should show to a user her managed and sub users (#2671)', () => {});

  xit('should show to a user the users she represents (#2671)', () => {
    //  ("gestelltvertretet")
  });

  xit('should show to a user the subusers of the user she represents (#2671)', () => {});

  xit('should show all the users to a catalogue admin (#2671)', () => {});

  xit('should show no users to a catalogue admin (#2671)', () => {});

  xit('catalogue admin should be able to see everything', () => {
    //Dashboard should give overview of data
    DashboardPage.visit();
    cy.contains('In Bearbeitung').parent().should('not.contain', 0);
    cy.contains('Veröffentlicht').parent().should('not.contain', 0);
    cy.get('text.text').should('not.contain', 0);

    //Documents should be present
    DocumentPage.visit();
    //Addresses should be present
    AddressPage.visit();
    // make sure folders ranking high in hierarchy are present and are displayed on top (= indicator for universal access rights)
    cy.contains('mat-tree-node', 'Neue Testadressen').invoke('attr', 'aria-level').should('equal', 1);
    //Users and groups should be present
    cy.visit('user');
    cy.url().should('contain', 'user');
    cy.contains('mat-toolbar .page-title', 'Nutzer & Rechte');
  });

  xit('should be possible to create users for a newly created metadata administrator (#2669)', () => {
    cy.visit('user');
    cy.get('.page-title').contains('Nutzer');

    let userLogIn = 'new-user-meta-admin';
    let userEmail = 'new-user-meta-admin@wemove.com';
    let userRole = 'Metadaten-Administrator';
    var psw = '';

    AdminUserPage.createNewUser(userLogIn, userEmail, userRole);

    // get email and extract the password
    cy.task('getLastEmail', userEmail)
      .its('body')
      .then(body => {
        expect(body).to.contain('Herzlich Willkommen beim IGE-NG');

        psw = body.substring(body.indexOf('Passwort: ') + 'Passwort: '.length, body.indexOf('(muss') - 1);

        cy.kcLogout();
        cy.get('.title', { timeout: 20000 }).should('contain', 'InGrid');

        cy.get('#username').type(userLogIn);
        cy.get('#password').type(psw);
        cy.get('#kc-login').click();

        cy.get('#kc-header-wrapper').should('contain', 'Update password');
        // create new user for the created user here
        cy.visit('user');

        let userNewLogIn = 'new-user-meta-admin';
        let userNewEmail = 'new-user-meta-admin@wemove.com';
      });
  });

  xit('should not show any object nor address to a metadata administrator without an assigned group (#2672)', () => {
    // Go to data section and make sure no single data is displayed
    DocumentPage.visit();
    cy.get('ige-form-dashboard').contains('Kein Ordner oder Datensatz vorhanden');
    // Also: make sure no data is displayed in the data list
    cy.get('ige-tree').contains('Leer');

    // Go to address section and make sure no single address is displayed
    AddressPage.visit();
    cy.get('ige-address-dashboard').contains('Kein Ordner oder Adresse vorhanden');
    // Also: make sure no address is displayed in the address list
    cy.get('ige-tree').contains('Leer');
  });

  // Research Page
  xit('user without authorization should be able to prompt SQL search by button but should not be shown any results', () => {
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    ResearchPage.getSearchResultCount().should('be', 0);
  });

  xit('Erweiterte Suche should show no search result to user without authorization, neither before nor after typing in search term', () => {
    // Make sure search page shows no data when visiting
    ResearchPage.visit();
    cy.get('.result').contains('0 Ergebnisse gefunden');
    // Make sure triggering search doesn't deliver search results
    ResearchPage.search('test');
    ResearchPage.getSearchResultCount().should('be', 0);
  });

  //TODO: Verification emails for user!
});
