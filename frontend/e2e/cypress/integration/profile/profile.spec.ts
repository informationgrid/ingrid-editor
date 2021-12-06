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
});
