import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../pages/base.page';

describe('Indexing', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  xit('Index and compare the start- and end-time', () => {
    // BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
  });

  xit('Set a cron expression and check', () => {});
});
