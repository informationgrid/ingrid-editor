import { ProfilePage } from '../../pages/profile.page';

describe('Profile', () => {
  beforeEach(() => {
    cy.kcLogout();
  });

  it('should check metadata administrator information', () => {
    cy.kcLogin('mcloud-meta-with-groups').as('tokens');
    ProfilePage.visit();
    let groups = ['test_gruppe_1', 'gruppe_mit_ortsrechten'];
    ProfilePage.checkUserInformation(
      'MetaAdmin',
      'mitGruppen',
      'mcloud-meta-with-groups',
      'Metadaten-Administrator',
      groups
    );
  });

  it('should update user first and last name', () => {
    let firstName = 'TestUpdated';
    let lastName = 'VerantwortlicherUpdated';
    cy.kcLogin('mcloud-catalog-user-profile').as('tokens');
    ProfilePage.visit();
    ProfilePage.changeUserFirstLastName(firstName, lastName, true);
  });

  it('should update catalog admin password', () => {
    cy.kcLogin('mcloud-catalog-check-metadata').as('tokens');
    ProfilePage.visit();
    // change user password with new password
    ProfilePage.changePassword(
      'mcloud-catalog-check-metadata',
      'mcloud-catalog-check-metadata',
      'new-mcloud-catalog-check-metadata'
    );

    // login again with new password using new fixture file
    cy.logoutClearCookies();
    cy.kcLogin('catalog-profile-test-with-new-pass');
    ProfilePage.visit();
    cy.logoutClearCookies();
  });

  it('should update autor password', () => {
    cy.kcLogin('mclould-author-profile').as('tokens');
    ProfilePage.visit();
    // change user password with new password
    ProfilePage.changePassword('mclould-author-profile', 'mclould-author-profile', 'autornewpass');

    // login again with new password using new fixture file
    cy.logoutClearCookies();
    cy.kcLogin('mclould-author-profile-with-new-pass');
    ProfilePage.visit();
    // reset the password
    ProfilePage.changePassword('mclould-author-profile', 'mclould-author-profile', 'mclould-author-profile');
    cy.logoutClearCookies();
  });

  it('should update meta admin password', () => {
    cy.kcLogin('mcloud-meta-profile').as('tokens');
    ProfilePage.visit();
    // change user password with new password
    ProfilePage.changePassword('mcloud-meta-profile', 'mcloud-meta-profile', 'meta3new');

    // login again with new password using new fixture file
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-profile-with-new-pass');
    ProfilePage.visit();
    cy.logoutClearCookies();
  });

  it('should update user email', () => {
    cy.kcLogin('mcloud-catalog-user-profile').as('tokens');
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
    cy.kcLogin('mcloud-catalog-user-profile').as('tokens');
    ProfilePage.visit();
    let existEmail = 'andre.wallat@wemove.com';
    ProfilePage.changeUserEmail(existEmail, false);
    cy.get('button[type="submit"]').click();
    cy.get('mat-dialog-container').contains('Die Email-Adresse ist schon vorhanden. Bitte wählen Sie eine andere aus.');
  });

  it('author should be able to update name and email (#3576)', () => {
    cy.kcLogin('mcloud-author-without-group').as('tokens');
    let newEmail = 'autortest@123omething.com';
    let newFirstName = 'testAutor';
    let newLastName = 'Autor2';
    ProfilePage.visit();
    ProfilePage.changeUserFirstLastName(newFirstName, newLastName, true);
    ProfilePage.changeUserEmail(newEmail, true);
  });
});
