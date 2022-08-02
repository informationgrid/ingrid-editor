import { AdminUserPage, keysInHeader, UserFormData } from '../../pages/administration-user.page';
import { DocumentPage } from '../../pages/document.page';
import { BasePage, UserAndRights } from '../../pages/base.page';
import { Utils } from '../../pages/utils';
import { ManageCatalogPage } from '../../pages/manage-catalog.page';
import { Menu } from '../../pages/menu';
import { AdminGroupPage } from '../../pages/administration-group.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';
import { Tree } from '../../pages/tree.partial';
import { CopyCutUtils } from '../../pages/copy-cut-utils';
import { ResearchPage } from '../../pages/research.page';

describe('User', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
  });

  it('should create a new user', () => {
    cy.get(AdminUserPage.addUserButton, { timeout: 5000 }).click();

    let user: UserFormData = {
      firstName: 'Son',
      lastName: 'Goku',
      email: '',
      login: 'loginz',
      role: '',
      groups: [],
      organisation: ''
    };

    AdminUserPage.addNewUser(user, false);
    // check "OK"-button not clickable, when mandatory fields are not filled
    cy.get('button').contains('Anlegen').parent().should('have.class', 'mat-button-disabled');

    // all mandatory fields must be filled
    user.email = 'test@wemove.com';
    user.role = 'Katalog-Administrator';
    AdminUserPage.addNewUser(user, false);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');

    AdminUserPage.confirmAddUserDialog();
    // check if user has been added to user list
    cy.contains('user-table', 'loginz');
  });

  it('should display the correct role symbol in the user list', () => {
    const username = 'Majid Ercan';

    AdminUserPage.selectUser(username);
    AdminUserPage.checkRoleSymbol(username, '[data-mat-icon-name=catalog-admin]');

    // check same symbol is also in #formUser visible
    cy.get('#formUser [data-mat-icon-name=catalog-admin]').should('be.visible');
  });

  it('should be possible to modify a user', () => {
    const email = 'metaadmin@wemove.com';
    const newEmail = 'metaadmin_modified@wemove.com';

    AdminUserPage.selectUser(email);
    // modify name of a user
    AdminUserPage.updateUser({ email: newEmail });

    // check modified entries were saved
    AdminUserPage.userShouldNotExist(email);
    AdminUserPage.userShouldExist(newEmail);
    AdminUserPage.selectUser(newEmail);

    // revert changes
    AdminUserPage.updateUser({ email: email });

    // check changes were returned
    AdminUserPage.userShouldNotExist(newEmail);
    AdminUserPage.userShouldExist(email);
  });

  it('should not be possible to empty a mandatory field and save (#2595)', () => {
    AdminUserPage.selectUser('Majid Ercan');

    // TODO: use updateUser-function to modify user form (see above)
    cy.get('[data-cy=email]  formly-field-mat-input').click().clear();
    // clicking another field is needed to activate the error-message
    cy.get('.firstName input').click().clear();
    cy.get('mat-error').should('have.length', 1);
    cy.get('.lastName input').click().clear();
    cy.get('mat-error').should('have.length', 2);
    // clicking another field is needed to activate the error-message
    cy.get('[data-cy=email]  formly-field-mat-input').click();
    cy.get('mat-error').should('have.length', 3);

    cy.get('mat-error').contains('Dieses Feld muss ausgefüllt sein').should('be.visible');
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');
  });

  it('should display the discard dialog, when changes on user entries are not saved (#2675)', () => {
    let name = 'Katalog Admin1';

    AdminUserPage.selectUser(name);
    // change name, then interrupt editing by trying to switch to another user
    // after canceling the prompt to discard changes, we are still in editing mode
    AdminUserPage.updateUser({ firstName: 'Modified' }, false);
    AdminUserPage.selectUser('Majid');
    AdminUserPage.cancelChanges();
    AdminUserPage.clearSearch();

    // check that firstname-Entry is not changed to the original value and that user is still selected
    cy.get('.firstName input').should('not.have.value', 'Katalog');
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
    cy.get('.user-title').contains('Modified Admin1');
    cy.get('user-table .selected').contains(name);

    // try to switch to another user, this time discarding all changes -> changes are undone, new user can be selected
    AdminUserPage.selectUser('Majid');
    AdminUserPage.discardChanges();

    // go back to original user profile and make sure data is unchanged
    AdminUserPage.selectUser(name);
    cy.get('.firstName input').should('have.value', 'Katalog');
    cy.get('.lastName input').should('have.value', 'Admin1');
  });

  it('should not display any dialog after the discard dialog has appeared (#2574)', () => {
    const username = 'Katalog Admin1';
    const newEntry = 'Tristan';

    // change something (name) and try to click on another user --> discard dialog appears
    AdminUserPage.selectUser(username);

    // adapt user entry and click on 'Hinzufügen'- button --> discard dialog must appear --> decline
    cy.get('.firstName input').click().clear().type(newEntry);
    cy.get(AdminUserPage.addUserButton, { timeout: 5000 }).click();
    AdminUserPage.cancelChanges();
    // new user dialog may not appear
    cy.get('ige-new-user-dialog').should('not.exist');

    // click on other tabmenu --> discard dialog must appear --> decline
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminUserPage.cancelChanges();
  });

  it('should display the discard dialog when the menu-page is changed with unsaved changes (#2619)', () => {
    const newEntry = 'Tralala';
    const username = 'Katalog Admin1';

    // change something and try to click on another user --> discard dialog appears
    AdminUserPage.selectUser(username);

    // adapt user entry
    cy.get('.firstName input').click().clear().type(newEntry);

    // click on other menu page --> discard dialog must appear --> decline
    Menu.switchTo('ADDRESSES', false);
    AdminUserPage.cancelChanges();
  });

  it('should not be possible for two users to have equal logins', () => {
    cy.get(AdminUserPage.addUserButton, { timeout: 5000 }).click();
    let user: UserFormData = {
      firstName: 'Son',
      lastName: 'Goku',
      email: 'test@wemove.com',
      login: 'ige',
      role: 'Katalog-Administrator',
      groups: [],
      organisation: ''
    };

    AdminUserPage.addNewUser(user, false);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.attemptIllegitimateApplyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    BasePage.checkErrorDialogMessage('Es existiert bereits ein Benutzer mit dem Login: ige');
  });

  it('should not be possible for two users to have equal email addresses', () => {
    cy.get(AdminUserPage.addUserButton, { timeout: 5000 }).click();
    let user: UserFormData = {
      firstName: 'Son',
      lastName: 'Goten',
      email: 'me@wemove.com',
      login: 'logingt',
      role: 'Autor',
      groups: [],
      organisation: ''
    };

    AdminUserPage.addNewUser(user, false);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.attemptIllegitimateApplyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    BasePage.checkErrorDialogMessage('Es existiert bereits ein Benutzer mit dieser Mailadresse');
  });

  it('should not be possible to change the login or the role after a user is created', () => {
    const username = 'Katalog Admin1';
    const username2 = 'Meta Admin';
    const username3 = 'Majid Ercan';

    //Katalog-Admin
    AdminUserPage.selectUser(username);
    cy.get('[data-cy=login]').should('not.be.enabled');
    cy.get('[data-cy=role]').should('not.be.enabled');

    //Meta-Admin
    AdminUserPage.selectUser(username2);
    cy.get('[data-cy=login]').should('not.be.enabled');
    cy.get('[data-cy=role]').should('not.be.enabled');

    //Autor
    AdminUserPage.selectUser(username3);
    cy.get('[data-cy=login]').should('not.be.enabled');
    cy.get('[data-cy=role]').should('not.be.enabled');
  });

  it('should display the organisation name in the user list view', () => {
    const username = 'Majid Ercan';

    AdminUserPage.selectUser(username);

    cy.get('#sidebarUser tr').contains('wemove digital solutions');
  });

  it('should show login and creation information', () => {
    const loginEntry = 'mcloud-meta-without-groups';
    const username = 'Meta Admin';

    AdminUserPage.selectUser(username);

    // check fields "Zuletzt eingeloggt", "Erstellt am", "Geändert am" and ID/login
    cy.get('[data-cy=showMoreData]').click();
    cy.get('[data-cy=headerMoreData]').should('be.visible');
    cy.get('[data-cy=headerMoreData]').contains('Zuletzt eingeloggt');
    cy.get('[data-cy=headerMoreData]').contains('Erstellt am');
    cy.get('[data-cy=headerMoreData]').contains('Geändert am');
    cy.get('[data-cy=headerMoreData]').contains(loginEntry);

    // compare the entry in ID/login with the Login- field
    cy.get('.user-title').contains(username);
  });

  it('should be possible to delete a user', () => {
    const toDelete = 'todel';
    AdminUserPage.selectUser(toDelete);
    // delete user
    AdminUserPage.deleteUser();
    cy.get('user-table').should('not.contain', toDelete);
  });

  it('should show only the names, emails, logins and organisations as result of a user search (#2551)', () => {
    AdminUserPage.searchForUser('Katalog');
    AdminUserPage.searchForUser('Katalog', 'Majid', false);

    AdminUserPage.searchForUser('Admin1');
    AdminUserPage.searchForUser('Admin1', 'Ercan', false);

    AdminUserPage.searchForUser('me@wemove.com');
    AdminUserPage.searchForUser('me@wemove.com', 'majid.ercan@wemove.com', false);

    AdminUserPage.searchForUser('wemove digital solutions');
    AdminUserPage.searchForUser('wemove digital solutions', 'Katalog Admin1', false);

    AdminUserPage.searchForUser('mcloud-catalog-check-metadata');
    AdminUserPage.searchForUser('mcloud-catalog-check-metadata', 'mcloud-catalog-authorization', false);
  });

  it('should find a user using her first- and lastname as search terms (#2596)', () => {
    cy.get('ige-search-field').type('Katalog Admin1');
    cy.get('user-table').should('not.contain', 'Majid');

    cy.get('user-table').should('contain', 'Katalog Admin1');
  });

  it('should display all information of a selected user and mark her as active (#2551)', () => {
    const username = 'Meta Admin';
    const username2 = 'Katalog Admin1';
    const username3 = 'autor test';

    // meta-admin
    AdminUserPage.selectUser(username);
    // check user was selected
    cy.get('tr.selected').contains(username);
    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
    // check user role
    AdminUserPage.checkRoleSymbol(username, '[data-mat-icon-name=meta-admin]');

    //catalog-admin
    AdminUserPage.selectUser(username2);
    // check user was selected
    cy.get('tr.selected').contains(username2);
    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
    // check user role
    AdminUserPage.checkRoleSymbol(username2, '[data-mat-icon-name=catalog-admin]');

    //author
    AdminUserPage.selectUser(username3);
    // check user was selected
    cy.contains('tr.selected', username3);
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
    cy.get('[data-cy=groups]').should('not.contain', groupName);

    // select group and save
    AdminUserPage.addGroupToUser(groupName);
    cy.get('[data-cy=groups]').should('contain', groupName);
    cy.get('[data-cy=groups]').should('not.contain', groupName2);

    AdminUserPage.addGroupToUser(groupName2);
    AdminUserPage.saveUser();

    // check groups were connected
    cy.get('[data-cy=groups]').should('contain', groupName);
    cy.get('[data-cy=groups]').should('contain', groupName2);

    // remove group-connection from user
    AdminUserPage.removeGroupFromUser(groupName);
    AdminUserPage.saveUser();
    cy.get('[data-cy=groups]').should('contain', groupName2);
    AdminUserPage.removeGroupFromUser(groupName2);
    AdminUserPage.saveUser();

    // check groups are not connected anymore
    cy.get('[data-cy=groups]').should('not.contain', groupName);
    cy.get('[data-cy=groups]').should('not.contain', groupName2);
  });

  it('should not be able to add the same group twice to a user (#3047)', () => {
    const username = 'autor test';
    const groupName = 'test_gruppe_1';

    // I. make sure that same group cannot be added twice consecutively
    AdminUserPage.selectUser(username);
    cy.get('[data-cy=groups]').should('not.contain', groupName);
    AdminUserPage.addGroupToUser(groupName);
    cy.get('[data-cy=groups]').should('contain', groupName);
    cy.get('.mat-select-panel-wrap').should('not.exist', { timeout: 10000 });

    // check if 'Testgruppe' is not selectable a second time
    cy.get('[data-cy=groups] mat-select').click();
    cy.get('.mat-option-disabled').should('contain', groupName);

    AdminUserPage.visit();
    AdminUserPage.selectUser('Test Verantwortlicher2');
    cy.get('[data-cy=groups]').should('contain', 'gruppe_mit_ortsrechten');
    // check if 'gruppe_mit_ortsrechten' is not selectable
    cy.get('[data-cy=groups] mat-select').click();
    cy.get('.mat-option-disabled').should('contain', 'gruppe_mit_ortsrechten');
  });

  it('should enable save button, when a user`s entries have changed (#2569)', () => {
    const username = 'Katalog Admin1';
    const modified = 'Vorname';

    AdminUserPage.selectUser(username);
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');

    cy.get('.firstName input').click().clear().type(modified);
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
  });

  it('should not be possible to click on another object, while the discard dialog is open (#2569)', () => {
    const username = 'Katalog Admin1';
    const username2 = 'Meta Admin';
    const modified = 'Vorname';

    AdminUserPage.selectUser(username);
    AdminUserPage.updateUser({ firstName: modified }, false);

    AdminUserPage.selectUser(username2);
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');

    // when overlay is findable, other entries are not clickable
    cy.get('mat-dialog-container').parent().parent().parent().find('.cdk-overlay-dark-backdrop');
  });

  it('should not leave the page after changes are canceled and the changes are not saved by discarding (#2569)', () => {
    const username = 'Katalog Admin1';
    const username2 = 'Meta Admin';
    const modified = 'Vorname';

    AdminUserPage.selectUser(username);
    AdminUserPage.updateUser({ firstName: modified }, false);
    AdminUserPage.selectUser(username2);

    // when save-button is disabled all changes are reverted
    AdminUserPage.discardChanges();
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');
    cy.get('.firstName input').click().clear().type(modified);
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');

    // when changes are canceled, save-button is enabled
    AdminUserPage.selectUser(username);
    AdminUserPage.cancelChanges();
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
    cy.get('.user-title').contains(modified + ' ' + 'Admin');
  });

  it('should show all the users to a catalogue admin (#2671)', () => {
    // login as super admin
    // get number of the users
    // logout from admin and login as catalog admin
    // get number of users and compare the two numbers
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
    cy.get('.page-title')
      .contains('Benutzer (')
      .then($text => {
        // get number of the users super admin
        let txt = $text.text();
        let regex = /\d+/g;
        let matches = txt.match(regex);
        cy.logoutClearCookies();
        cy.kcLogin('mcloud-catalog-authorization');
        AdminUserPage.visit();
        cy.intercept('GET', '/api/users').as('usersCall');
        cy.wait('@usersCall');
        cy.get('.page-title')
          .contains('Benutzer (')
          .then($txtCatalog => {
            // get number of the users catalog admin
            let txtCatalog = $txtCatalog.text();
            let matchesCatalog = txtCatalog.match(regex);
            let catalogNumber = Number(matchesCatalog![0]);
            let superUserNumber = Number(matches![0]) - 1;
            expect(catalogNumber.toString()).to.eq(superUserNumber.toString());
          });
      });
  });

  it('Creation of a user after it has been previously deleted (#3108)', () => {
    let userLogIn = 'user-to-be-deleted-after-creation';
    let userEmail = 'new-user-to-be-deleted@wemove.com';
    let userRole = 'Metadaten-Administrator';

    AdminUserPage.createNewUser(userLogIn, userEmail, userRole);
    // check user has been created
    AdminUserPage.selectUser(userLogIn);
    // delete user
    AdminUserPage.deleteUser();

    AdminUserPage.userShouldNotExist(userLogIn + ' ' + userLogIn);

    // create user again
    AdminUserPage.createNewUser(userLogIn, userEmail, userRole);

    AdminUserPage.userShouldExist(userLogIn + ' ' + userLogIn);
  });

  it('should be possible to create users for a newly created metadata administrator (#2669)', () => {
    const uid1 = Utils.randomDoubleDigitString();
    const uid2 = Utils.randomDoubleDigitString();
    let firstUserLogIn = 'first-new-meta' + uid1;
    let firstUserEmail = 'first-new-meta' + uid1 + '@wemove.com';
    let secondUserLogIn = 'second-new-meta' + uid2;
    let secondUserEmail = 'second-new-meta' + uid2 + '@wemove.com';
    let userRole = 'Metadaten-Administrator';

    // create first user
    AdminUserPage.createNewUser(firstUserLogIn, firstUserEmail, userRole);
    //  extract and update first user password then login
    AdminUserPage.extractAndResetNewUserPassword(firstUserLogIn, firstUserEmail, userRole);

    AdminUserPage.visit();

    // create second user
    AdminUserPage.createNewUser(secondUserLogIn, secondUserEmail, userRole);
    // extract and update second user password then login
    AdminUserPage.extractAndResetNewUserPassword(secondUserLogIn, secondUserEmail, userRole);
  });

  //TODO: Verification emails for user!

  it('should show limited range of users to catalog admin (#3538)', () => {
    // log in as cat admin
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-catalog-switch-catalog');
    // reload with changed user loginn
    AdminUserPage.visit();
    AdminUserPage.userShouldNotExist('andre.wallat@wemove.com');
    // switch catalog
    Menu.switchToGeneral('CATALOG_MANAGEMENT');

    ManageCatalogPage.switchToCatalog('Test_Mass_Data');
    // a cat admin assigned to the same catalog should be visible
    Menu.switchTo('USERS');
    AdminUserPage.userShouldExist('masstest@something.com');
    // cat admins not belonging to catalog should not be visible
    AdminUserPage.userShouldNotExist('me@wemove.com');
  });

  it.only('should update user information (#2972)', () => {
    const dateOfToday = new Date().toLocaleDateString('de', { day: 'numeric', month: 'long', year: 'numeric' });

    AdminUserPage.selectUser('mcloud-author-last-login');
    AdminUserPage.getInfoInHeader(keysInHeader.LastLogin, false, true).then(oldLoginDate => {
      // log in as a user to update last login information
      cy.logoutClearCookies();
      cy.kcLogin('mcloud-author-last-login');
      DocumentPage.visit();
      // log in as admin and make sure "last logged in" contains right information
      cy.logoutClearCookies();
      cy.kcLogin('super-admin');
      AdminUserPage.visit();
      AdminUserPage.selectUser('mcloud-author-last-login');
      // make sure last-login-date is not identical to old login-date, but identical to current date
      AdminUserPage.getInfoInHeader(keysInHeader.LastLogin, false, true).then(newLoginDate => {
        cy.wrap(newLoginDate).should('not.eql', oldLoginDate).and('contain', dateOfToday);
      });
      AdminUserPage.getInfoInHeader(keysInHeader.EditDate, true, true).then(oldEditDate => {
        // change user profile and make sure information is updated accordingly
        AdminUserPage.updateUser({ organisation: 'someRandomOrganization' });
        cy.wait(500);
        AdminUserPage.getInfoInHeader(keysInHeader.EditDate, true, true).then(newEditDate => {
          cy.wrap(oldEditDate).should('not.eql', newEditDate);
        });
      });
    });
  });

  it('Author can be granted universal read access by adding to group universal rights #3267', () => {
    const groupName = 'test_gruppe_3';
    const authorName = 'mcloud-author-with-group';

    // activate universal read access in group
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Leserecht');
    UserAuthorizationPage.changeAccessRightFromWriteToRead('Neue Testdokumente', 'Daten');
    AdminGroupPage.saveGroup();
    // log in as author
    cy.logoutClearCookies();
    cy.kcLogin(authorName);
    // check read access data
    DocumentPage.visit();
    cy.get('mat-tree mat-tree-node')
      .each(item => {
        cy.wrap(item).should('have.class', 'readonly');
      })
      .its('length')
      .should('be.greaterThan', 50);
    // check read access addresses
    Menu.switchTo('ADDRESSES');
    cy.get('mat-tree mat-tree-node')
      .each(item => {
        cy.wrap(item).should('have.class', 'readonly');
      })
      .its('length')
      .should('be.greaterThan', 10);
    // login as ige and withdraw access
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Leserecht', true);
    UserAuthorizationPage.changeAccessRightFromReadToWrite('Neue Testdokumente', 'Daten');
    AdminGroupPage.saveGroup();
  });

  it('Author can be granted universal read + write access by adding to group universal rights #3267', () => {
    const groupName = 'test_gruppe_3';
    const authorName = 'mcloud-author-with-group';

    // activate universal access in group
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Schreibrecht');
    AdminGroupPage.saveGroup();
    // log in as author
    cy.logoutClearCookies();
    cy.kcLogin(authorName);
    // check write access data
    DocumentPage.visit();
    cy.get('mat-tree mat-tree-node')
      .each(item => {
        cy.wrap(item).should('not.have.class', 'readonly');
      })
      .its('length')
      .should('be.greaterThan', 50);
    // check document can be edited
    Tree.openNode(['Doc_h']);
    DocumentPage.addDescription('some description');
    DocumentPage.saveDocument();
    DocumentPage.checkValueOfField('[data-cy="description"]', 'textarea', 'some description');
    // check write access addresses
    Menu.switchTo('ADDRESSES');
    cy.get('mat-tree mat-tree-node')
      .each(item => {
        cy.wrap(item).should('not.have.class', 'readonly');
      })
      .its('length')
      .should('be.greaterThan', 10);
    // login as ige and withdraw access
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Schreibrecht', true);
    // revoke read access that was automatically granted with right access
    AdminGroupPage.grantOrRevokeUniversalRights('Leserecht', true);
    AdminGroupPage.saveGroup();
  });

  it('Author can create root document/move and copy document to root when granted universal read + write access #3267', () => {
    const groupName = 'test_gruppe_3';
    const authorName = 'mcloud-author-with-group';

    // activate universal access in group
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Schreibrecht');
    AdminGroupPage.saveGroup();
    // log in as author
    cy.logoutClearCookies();
    cy.kcLogin(authorName);

    // create root document
    DocumentPage.visit();
    DocumentPage.createDocument('newRootDoc');

    // move to root
    Tree.openNode(['Folder_g', 'Folder_g_1']);
    CopyCutUtils.move();
    Tree.openNode(['Folder_g_1']);

    // copy to root
    Tree.openNode(['Folder_j', 'Doc_j_1']);
    CopyCutUtils.copyObject();
    Tree.openNode(['Doc_j_1']);

    // login as ige and withdraw access
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Schreibrecht', true);
    // revoke read access that was automatically granted with right access
    AdminGroupPage.grantOrRevokeUniversalRights('Leserecht', true);
    AdminGroupPage.saveGroup();
  });

  it('Author should be able to delete any document when granted universal read + write access #3267', () => {
    const groupName = 'test_gruppe_3';
    const authorName = 'mcloud-author-with-group';

    // activate universal access in group
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Schreibrecht');
    AdminGroupPage.saveGroup();
    // log in as author
    cy.logoutClearCookies();
    cy.kcLogin(authorName);

    // delete document
    DocumentPage.visit();
    Tree.openNode(['Doc_m']);
    DocumentPage.deleteLoadedNode();
    cy.contains('ige-tree mat-tree-node', 'Doc_m').should('not.exist');

    // login as ige and withdraw access
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.grantOrRevokeUniversalRights('Schreibrecht', true);
    // revoke read access that was automatically granted with right access
    AdminGroupPage.grantOrRevokeUniversalRights('Leserecht', true);
    AdminGroupPage.saveGroup();
  });

  it('should download user data as CSV file #3943', () => {
    AdminUserPage.getUserData().then(arr1 => {
      AdminUserPage.downloadCSVFile();
      AdminUserPage.getUserDataFromCSV().then(arr2 => {
        // compare the content of the two arrays
        expect(arr2).to.have.members(arr1);
      });
    });
  });

  it('should auto-complete fields in add-user-dialog for keycloak-registered user (#4032)', () => {
    let user = {
      firstName: 'autor',
      lastName: 'new3',
      email: 'autornew3@test.com',
      login: 'author-check-autocomplete'
    };

    cy.get(AdminUserPage.addUserButton).click();
    cy.get('[data-cy="login"] input').click();
    cy.contains('[role="option"]', user.login).click();

    // check automatically filled fields
    cy.get('.firstName input').should('have.value', user.firstName);
    cy.get('.lastName input').should('have.value', user.lastName);
    cy.get('[data-cy="email"] input').should('have.value', user.email);

    // role field should not be filled with a value
    DocumentPage.checkContentOfField('[data-cy="role"]', 'mat-select', '');
    // the add-button should not be activated
    cy.contains('button', 'Anlegen').should('be.disabled');
  });
});
