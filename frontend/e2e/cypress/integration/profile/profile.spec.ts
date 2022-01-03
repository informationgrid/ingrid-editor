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
    cy.get('[data-cy="change-full-name-id"]').click();
    cy.get('ige-change-name-dialog').find('input').first().clear().type(firstName);
    cy.get('ige-change-name-dialog').find('input').eq(1).clear().type(lastName);
    cy.intercept('GET', 'api/info/currentUser').as('getUser');
    cy.get('ige-change-name-dialog').find('button').contains('Ändern').first().click();
    cy.wait('@getUser');
    cy.get('div .main-content').contains(firstName);
    cy.get('div .main-content').contains(lastName);
  });

  xit('should update user password', () => {
    // ToDo request a change password
  });

  xit('should update user email', () => {
    cy.kcLogin('meta2').as('tokens');
    ProfilePage.visit();
  });

  xit('should not update user email with already exist one', () => {
    cy.kcLogin('meta2').as('tokens');
  });
});
