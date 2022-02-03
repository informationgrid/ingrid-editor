import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu, CodelistSubMenu } from '../../pages/base.page';
import { CodelistPage, Formats } from '../../pages/codelist.page';

describe('Codelist', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  it('Add, modify, set as default and delete a Codelist-Entry and review all changes', () => {
    const entryTitle = 'Test-Codelist-Entry-01';
    const changedTitle = 'Straßen_everywhere_9000';
    const toDelete = 'Bahn';

    CodelistPage.chooseDataFormat(Formats.mCLOUD);

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
    cy.intercept('PUT', /api\/codelist\/manage/, {
      statusCode: 200,
      body: {
        defaultEntry: 'TEST'
      }
    }).as('applyDefault');
    CodelistPage.openContextMenu(newEntry, CodelistSubMenu.Defaultwert);
    // intercept the setting as new default to give the application time to adjust to new state
    cy.wait('@applyDefault');
    cy.get('mat-panel-description').should('contain', 'Defaultwert');

    // remove default value
    cy.intercept('PUT', /api\/codelist\/manage/, {
      statusCode: 200,
      body: {
        defaultEntry: 'null'
      }
    }).as('removeDefault');
    CodelistPage.openContextMenu(newEntry, CodelistSubMenu.Defaultwert);
    cy.wait('@removeDefault');
    cy.get('mat-panel-description').should('not.contain', 'Defaultwert');
  });
});
