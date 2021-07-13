import { AdminPage } from '../../pages/administration.page';

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
    AdminPage.addNewUserEmail('nb@wemove.com');
    AdminPage.addNewUserRole(1);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');

    AdminPage.addNewUserApplyWithoutError();
  });

  it('the correct role symbol are shown at user list view', () => {
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
    cy.get('[data-cy=Name] .firstName').type(' SV');
    cy.get('[data-cy=Name] .lastName').type(' W');
    AdminPage.toolbarSaveUser();

    // check modiefied entries were saved
    cy.get('tbody').should('not.contain', 'Majid Ercan');
    cy.get('tbody').should('contain', 'Majid SV Ercan W');

    // return changes
    cy.get('tbody').contains('Majid SV Ercan W').click();
    cy.get('#formUser').should('be.visible');
    cy.get('[data-cy=Name] .firstName').click().clear().type('Majid');
    cy.get('[data-cy=Name] .lastName').click().clear().type('Ercan');
    AdminPage.toolbarSaveUser();

    // check changes were returned
    cy.get('tbody').should('contain', 'Majid Ercan');
  });

  xit('should not possible to empty a mandatory field and save', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    cy.get('[data-cy=Name] .firstName').click().clear();
    // TODO: BUG --> discuss with Benny ##2595
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

  it('should not possible to have equal logins', () => {
    cy.get('.page-title').contains('Nutzer');
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminPage.addNewUserLogin('ige');
    AdminPage.addNewUserFirstname('Son');
    AdminPage.addNewUserLastname('Goku');
    AdminPage.addNewUserEmail('nb@wemove.com');
    AdminPage.addNewUserRole(1);
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminPage.addNewUserClickSave();

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
    cy.get('.more-info > div:nth-child(4)').contains(loginEntry);

    // compare the entry in ID/login with the Login- field
    cy.get('.label').contains(loginEntry);
  });

  xit('should be possible to delete a user', () => {
    // keyclock-db new user
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

  it('should be possible to add and remove a group (or different groups) to a user', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    // check no group connected
    cy.get('[data-cy=Gruppen]').should('not.contain', 'Gruppe 42');

    // select group and save
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('mat-option').contains('Gruppe 42').click();
    AdminPage.toolbarSaveUser();

    // check group 'Gruppe 42' was connected
    cy.get('[data-cy=Gruppen]').should('contain', 'Gruppe 42');

    // remove group-connection from user
    cy.get('[data-cy=Gruppen] [data-mat-icon-name=Entfernen]').click({ force: true });
    AdminPage.toolbarSaveUser();

    // check group 'Gruppe 42' is not connected anymore
    cy.get('[data-cy=Gruppen]').should('not.contain', 'Gruppe 42');
  });

  it('should not possible to add a group twice to one user', () => {
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');
    cy.get('[data-cy=Gruppen]').should('not.contain', 'Gruppe 42');
    cy.get('[data-cy=Gruppen] mat-select').click();
    cy.get('mat-option').contains('Gruppe 42').click();

    // check if 'Gruppe 42' is not select twice
    cy.get('[data-cy=Gruppen] mat-select').should('not.be.enabled');
  });

  //TODO: Verification emails for user!
});
