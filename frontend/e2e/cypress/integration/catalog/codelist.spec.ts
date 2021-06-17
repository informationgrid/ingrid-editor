import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu, CodelistSubMenu } from '../../pages/base.page';
import { CodelistPage } from '../../pages/codelist.page';

describe('Codelist', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('Add, modify, set as default and delete a Codelist-Entry and review all changes', () => {
    const entryTitle = 'Test-Codelist-Entry-01';
    const changedTitle = 'Straßen_everywhere_9000';
    const toDelete = 'Bahn';

    // add new codelist-entry
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Codelisten);
    CodelistPage.addNewEntry(entryTitle);
    CodelistPage.checkCodelistEntry(entryTitle, true);

    // modify a codelist-entry
    CodelistPage.openContextMenu('Straßen', CodelistSubMenu.Bearbeiten);
    CodelistPage.changeEntry(changedTitle, 'roads', 'de');
    CodelistPage.checkCodelistEntry(changedTitle, true);

    // delete a codelist-entry
    CodelistPage.openContextMenu(toDelete, CodelistSubMenu.Loeschen);
    CodelistPage.deleteCodelistEntry();
    CodelistPage.checkCodelistEntry(toDelete, false);

    // reset all changes
    CodelistPage.resetCodelistEntries();
    CodelistPage.checkCodelistEntry(entryTitle, false);
    CodelistPage.checkCodelistEntry(toDelete, true);
  });

  it('Set a new Codelist-Entry as default, check and remove default value ', () => {
    const newEntry = 'Seilbahn';

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Codelisten);
    CodelistPage.addNewEntry(newEntry);
    CodelistPage.checkCodelistEntry(newEntry, true);

    // set a new entry as default
    CodelistPage.openContextMenu(newEntry, CodelistSubMenu.Defaultwert);
    cy.get('mat-panel-description').should('contain', 'Defaultwert');

    // remove default value
    CodelistPage.openContextMenu(newEntry, CodelistSubMenu.Defaultwert);
    cy.get('mat-panel-description').should('not.contain', 'Defaultwert');
  });

  xit('Check default set Codelist-entry is staid in a new document', () => {});
});
