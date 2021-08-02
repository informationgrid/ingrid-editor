import { AdminPage } from '../../pages/administration.page';
import { DocumentPage } from '../../pages/document.page';
import { UserAndRights } from '../../pages/base.page';
import { catchError } from 'rxjs/operators';

describe('User', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should create a new user', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminPage.addNewUserLogin('loginZ');
    AdminPage.addNewUserFirstname('Son');
    AdminPage.addNewUserLastname('Goku');

    // check "OK"-button not clickable, when not all mandatory fields are filled
    cy.get('button').contains('Anlegen').parent().should('have.class', 'mat-button-disabled');

    // all mandatory fields must be filled
    AdminPage.addNewUserEmail('test@wemove.com');
    AdminPage.addNewUserRole(1);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');

    AdminPage.addNewUserApplyWithoutError();
  });

  it('the correct role symbol should be in user list', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#sidebarUser tr')
      .contains('Majid Ercan')
      .parent()
      .parent()
      .find('[data-mat-icon-name=catalog-admin]')
      .should('be.visible');
    cy.get('#formUser').should('be.visible');
    cy.get('#formUser [data-mat-icon-name=catalog-admin]').should('be.visible');
  });

  it('should be possible to rename user', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    // modify name of a user
    cy.get('[data-cy=Name] .firstName').click().clear().type('Martin');
    cy.get('[data-cy=Name] .lastName').click().clear().type('Engel');
    AdminPage.toolbarSaveUser();

    // check modiefied entries were saved
    cy.get('tbody').should('not.contain', 'Majid Ercan');
    cy.get('tbody').should('contain', 'Martin Engel');

    // return changes
    cy.get('tbody').contains('Martin Engel').click();
    cy.get('#formUser').should('be.visible');
    cy.get('[data-cy=Name] .firstName').click().clear().type('Majid');
    cy.get('[data-cy=Name] .lastName').click().clear().type('Ercan');
    AdminPage.toolbarSaveUser();

    // check changes were returned
    cy.get('tbody').should('contain', 'Majid Ercan');
  });

  it('should not possible to empty a mandatory field and save (#2595)', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    cy.get('[data-cy=E-Mail]  formly-field-mat-input').click().clear();
    cy.get('[data-cy=Name] .firstName').click().clear();
    cy.get('[data-cy=Name] .lastName').click().clear();
    cy.get('[data-cy=E-Mail]  formly-field-mat-input').click();

    cy.get('mat-error').contains('Dieses Feld muss ausgefüllt sein').should('be.visible');
    cy.get('mat-error').should('have.length', 3);
    cy.get('[data-cy=toolbar_save_user]').should('be.disabled');
  });

  it('discard dialog must be appear, when changes on users were not saved', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    cy.get('[data-cy=Name] .firstName').click().clear().type('Tralala');
    cy.get('tbody').contains('Andre Wallat').click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-discard]').click();

    cy.get('tbody').contains('Majid Ercan').click();
  });

  it('decline discard dialog do not reject all user changes', () => {
    const entry = 'Tralala';

    // change something (name) and try to click on anthother user --> discard dialog appears
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    cy.get('[data-cy=Name] .firstName').click().clear().type(entry);
    cy.get('tbody').contains('Andre Wallat').click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');

    // reject dialog --> the changes must be the same and it must be possible to save
    cy.get('[data-cy=confirm-dialog-cancel]').click();

    // check firstname-Entry is not changed to the value before
    cy.get('[data-cy=Name] .firstName').invoke('text').should('not.equal', 'Majid');
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
  });

  it('after discard dialog appears no other dialog may appear after it (#2574)', () => {
    const entry = 'Tralala';

    // change something (name) and try to click on anthother user --> discard dialog appears
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    // adapt user entry and click on 'Hinzufügen'- button --> discard dialog must appear --> decline
    cy.get('[data-cy=Name] .firstName').click().clear().type(entry);
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
    // new user dialog may not appear
    cy.get('ige-new-user-dialog').should('not.exist');

    // click on other tabmenu --> discard dialog must appear --> decline
    AdminPage.goToTabmenu(UserAndRights.Group);
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  });

  it('should not be possible to change menupage without appearing discard dialog (#2619)', () => {
    const entry = 'Tralala';

    // change something (name) and try to click on anthother user --> discard dialog appears
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');
    // adapt user entry
    cy.get('[data-cy=Name] .firstName').click().clear().type(entry);

    // click on other menu page --> discard dialog must appear --> decline
    cy.get(DocumentPage.Sidemenu.Adressen).click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  });

  it('should not possible to have equal logins', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminPage.addNewUserLogin('ige');
    AdminPage.addNewUserFirstname('Son');
    AdminPage.addNewUserLastname('Goku');
    AdminPage.addNewUserEmail('test@wemove.com');
    AdminPage.addNewUserRole(1);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminPage.applyDialog();

    // error-message
    cy.get('[data-cy=error-dialog-title]').should('be.visible');
    cy.get('[data-cy=error-dialog-content]').contains('Es existiert bereits ein Benutzer mit dem Login: ige');
  });

  it('should not possible to change login or role after user is created', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    cy.get('[data-cy=Login]').should('not.be.enabled');
    cy.get('[data-cy=Rolle]').should('not.be.enabled');
  });

  it('organisation name must be shown at user list view', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('tbody').contains('Majid Ercan');

    cy.get('#sidebarUser tr').contains('wemove digital solutions');
  });

  it('show login- and creation informations', () => {
    const loginEntry = 'ige2';

    cy.get('tbody').contains('Majid Ercan').click();

    // check fields "Zuletzt eingeloggt", "Erstellt am", "Geändert am" and ID/login
    cy.get('.user-title [data-mat-icon-type=font]').click();
    cy.get('.more-info').should('be.visible');
    cy.get('.more-info > div:nth-child(1)').contains('Zuletzt eingeloggt');
    cy.get('.more-info > div:nth-child(2)').contains('Erstellt am');
    cy.get('.more-info > div:nth-child(3)').contains('Geändert am');
    cy.get('.more-info > div:nth-child(4)').contains('Verantwortlich');
    cy.get('.more-info > div:nth-child(5)').contains(loginEntry);

    // compare the entry in ID/login with the Login- field
    cy.get('.label').contains(loginEntry);
  });

  it('should be possible to delete a user', () => {
    const toDelete = 'Meins Deins';

    cy.get('.page-title').contains('Nutzer');
    cy.get('tbody').contains(toDelete).click();
    cy.get('#formUser').should('be.visible');
    cy.get('#formUser [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content').contains('löschen').should('be.visible');
    cy.get('[data-cy=confirm-dialog-ok]').click();

    cy.get('tbody').should('not.contain', toDelete);
  });

  it('only names, emails, logins or organisations can be user search results (#2551)', () => {
    cy.get('tbody').should('contain', 'Andre');
    cy.get('tbody').should('contain', 'Majid');

    cy.get('ige-search-field').type('Andre');
    cy.get('tbody').should('not.contain', 'Majid');

    cy.get('ige-search-field').clear().type('Wallat');
    cy.get('tbody').should('not.contain', 'Ercan');

    cy.get('ige-search-field').clear().type('andre.wallat@wemove.com');
    cy.get('tbody').should('not.contain', 'majid.ercan@wemove.com');

    cy.get('ige-search-field').clear().type('wemove digital solutions');
    cy.get('tbody').should('not.contain', 'Andre');

    cy.get('ige-search-field').type('ige2');
    cy.get('tbody').should('not.contain', 'ige');
  });

  it('a user can be found with his first- and lastname (#2596)', () => {
    cy.get('ige-search-field').type('Andre Wallat');
    cy.get('tbody').should('not.contain', 'Majid');

    cy.get('tbody').should('contain', 'Andre Wallat');
  });

  it('selected user must be active and all informations to it must be shown (#2551)', () => {
    cy.get('tbody').contains('Majid Ercan').click();

    // check user 'Majid Ercan' was selected
    cy.get('td.selected').contains('Majid Ercan');

    // check user informations were loaded
    cy.get('#formUser').should('be.visible');
  });

  it('should be possible to add and remove a group (or different groups) to a user', () => {
    const groupName = 'Gruppe 42';
    const groupName2 = 'Testgruppe';

    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    // check no group connected
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);

    // select group and save
    AdminPage.selectUserGroupConnection(groupName);
    AdminPage.selectUserGroupConnection(groupName2);
    AdminPage.toolbarSaveUser();

    // check groups were connected
    cy.get('[data-cy=Gruppen]').should('contain', groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName2);

    // remove group-connection from user
    AdminPage.removeUserGroupConnection(groupName);
    AdminPage.removeUserGroupConnection(groupName2);
    AdminPage.toolbarSaveUser();

    // check groups are not connected anymore
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName2);
  });

  it('should not possible to add a group twice to one user', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');
    cy.get('[data-cy=Gruppen]').should('not.contain', 'Gruppe 42');
    AdminPage.selectUserGroupConnection('Gruppe 42');

    // check if 'Gruppe 42' is not selectable a second time
    cy.get('[data-cy=Gruppen] mat-select').should('not.be.enabled');
  });

  //TODO: Verification emails for user!
});
