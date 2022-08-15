import { ProfilePage } from '../../pages/profile.page';
import { DashboardPage } from '../../pages/dashboard.page';

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

  it('should update user first, last name, and email respectively #4088 ', () => {
    let oldFirstName = 'Test';
    let oldLastName = 'Verantwortlicher2';
    let newFirstName = 'newFirstName';
    let newLastName = 'newLastName';
    let oldEmail = 'metadatenadmin@something.com';
    let newEmail = 'newmetadatenadmin1@something.com';
    cy.kcLogin('mcloud-meta-profile').as('tokens');
    ProfilePage.visit();
    // change only the first name, reload and check before and after reload
    ProfilePage.changeUserFirstName(newFirstName, true);
    cy.get('div .main-content').contains(oldLastName);
    cy.get('div .main-content').contains(oldEmail);
    cy.pageReload('.info-header-row', 'Persönliche Daten');
    cy.get('div .main-content').contains(newFirstName);
    cy.get('div .main-content').contains(oldLastName);
    cy.get('div .main-content').contains(oldEmail);
    // change only the last name, reload and check before and after reload
    ProfilePage.changeUserLastName(newLastName, true);
    cy.get('div .main-content').contains(oldEmail);
    cy.pageReload('.info-header-row', 'Persönliche Daten');
    cy.get('div .main-content').contains(newFirstName);
    cy.get('div .main-content').contains(newLastName);
    cy.get('div .main-content').contains(oldEmail);
    // change only the email , reload and check
    ProfilePage.changeUserEmail(newEmail, true);
    cy.get('div .main-content').contains(newFirstName);
    cy.get('div .main-content').contains(newLastName);
    cy.get('div .main-content').contains(newEmail);
    cy.pageReload('.info-header-row', 'Persönliche Daten');
    cy.get('div .main-content').contains(newEmail);
    cy.get('div .main-content').contains(newFirstName);
    cy.get('div .main-content').contains(newLastName);
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
    cy.get('mat-dialog-container').contains(
      'Diese E-Mail-Adresse wird bereits für einen anderen Benutzernamen verwendet.'
    );
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

  it('should check for forget password functionality #4033', () => {
    cy.visit('');
    cy.contains('a', 'Passwort vergessen?').click();
    let userEmail = 'autor-forgetpass@test.com';

    cy.get('.reset-password-field  input ').type(userEmail);
    cy.contains('button', 'Absenden').click();

    cy.wait(5000);
    // get email and extract the password
    cy.task('getLastEmail', userEmail)
      .its('body')
      .then(body => {
        expect(body).to.contain('Es wurde eine Änderung der Anmeldeinformationen für Ihren Account');

        // Extract the link
        let bodyArray = body.split('\n\n');
        let resetLink = bodyArray[1];

        // use force visit because of port number in the link
        cy.forceVisit(resetLink);

        let newPassword = '123FFffGex@$wtab129nn';
        cy.get('#password-new').type(newPassword);
        cy.get('#password-confirm').type(newPassword);
        cy.get('#kc-login').click();
        cy.get('.dashboard-content', { timeout: 10000 }).should('exist');
        cy.logoutClearCookies();
        cy.kcLogin('author-profile-test-forget-pass');
        DashboardPage.visit();
      });
  });
});
