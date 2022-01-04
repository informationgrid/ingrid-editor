import { ProfilePage } from '../../pages/profile.page';

describe('Profile', () => {
  beforeEach(() => {
    cy.kcLogout();
  });

  it('should check metadata administrator information', () => {
    cy.kcLogin('meta2').as('tokens');
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

  xit('should update user password', () => {
    // ToDo request a change password
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
});
