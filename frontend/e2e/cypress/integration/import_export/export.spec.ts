import { ExportPage } from '../../pages/export.page';

describe('Export', () => {
  beforeEach(() => {
    cy.kcLogout();
  });

  xit('should export a single published document with options "Nur diesen Datensatz", "IGE" ', () => {
    cy.kcLogin('user').as('tokens');
    ExportPage.visit();
  });
});
