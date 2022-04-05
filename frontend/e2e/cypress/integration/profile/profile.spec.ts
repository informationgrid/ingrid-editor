import { ProfilePage } from '../../pages/profile.page';

describe('Profile', () => {
  beforeEach(() => {
    cy.kcLogout();
  });

  it('should check metadata administrator information', () => {
    cy.kcLogin('meta2-with-groups').as('tokens');
    ProfilePage.visit();
    let groups = ['test_gruppe_1', 'gruppe_mit_ortsrechten'];
    ProfilePage.checkUserInformation('MetaAdmin', 'mitGruppen', 'meta2', 'Metadaten-Administrator', groups);
  });

  it('should update user first and last name', () => {
    let firstName = 'TestUpdated';
    let lastName = 'VerantwortlicherUpdated';
    cy.kcLogin('drei').as('tokens');
    ProfilePage.visit();
    ProfilePage.changeUserFirstLastName(firstName, lastName, true);
  });

  it('should update catalog admin password', () => {
    cy.kcLogin('ige2').as('tokens');
    ProfilePage.visit();
    // change user password with new password
    ProfilePage.changePassword('ige2', 'mdek', 'ige2');

    // login again with new password using new fixture file
    cy.kcLogout();
    cy.kcLogin('ige2_with_new_pass');
    ProfilePage.visit();
    cy.kcLogout();
  });

  it('should update autor password', () => {
    cy.kcLogin('author-profile-test').as('tokens');
    ProfilePage.visit();
    // change user password with new password
    ProfilePage.changePassword('autornew', 'autornew', 'autornewpass');

    // login again with new password using new fixture file
    cy.kcLogout();
    cy.kcLogin('author-profile-test-with-new-pass');
    ProfilePage.visit();
    // reset the password
    ProfilePage.changePassword('autornew', 'autornew', 'autornew');
    cy.kcLogout();
  });

  it('should update meta admin password', () => {
    cy.kcLogin('meta3-profile-test').as('tokens');
    ProfilePage.visit();
    // change user password with new password
    ProfilePage.changePassword('meta3', 'meta3', 'meta3new');

    // login again with new password using new fixture file
    cy.kcLogout();
    cy.kcLogin('meta3-profile-test-with-new-pass');
    ProfilePage.visit();
    cy.kcLogout();
  });

  it('should update user email', () => {
    cy.kcLogin('drei').as('tokens');
    ProfilePage.visit();
    let invalidEmail = 'katalogadmintest@###something.com';
    let validEmail = 'katalogadmintest@123omething.com';
    ProfilePage.changeUserEmail(invalidEmail, false);
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('input[type="email"]').clear().type(validEmail);
    cy.get('button').contains(' Abbrechen ').click();
    ProfilePage.changeUserEmail(validEmail, true);
  });

  it('should not update user email with already exist one', () => {
    cy.kcLogin('drei').as('tokens');
    ProfilePage.visit();
    let existEmail = 'andre.wallat@wemove.com';
    ProfilePage.changeUserEmail(existEmail, false);
    cy.get('button[type="submit"]').click();
    cy.get('mat-dialog-container').contains('Die Email-Adresse ist schon vorhanden. Bitte wählen Sie eine andere aus.');
  });

  it('author should be able to update name and email (#3576)', () => {
    cy.kcLogin('author-without-groups').as('tokens');
    let newEmail = 'autortest@123omething.com';
    let newFirstName = 'testAutor';
    let newLastName = 'Autor2';
    ProfilePage.visit();
    ProfilePage.changeUserFirstLastName(newFirstName, newLastName, true);
    ProfilePage.changeUserEmail(newEmail, true);
  });
});
