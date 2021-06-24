import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../pages/base.page';
import { AddressPage } from '../../pages/address.page';
import { DocumentPage } from '../../pages/document.page';

describe('Indexing', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('Index and check indexed object counter has increased', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();

    const statusEntry = cy.get('div.status').invoke('text');

    cy.get('button').contains('Indizieren').click();
    DocumentPage.waitUntilElementIsVisible("div.status:contains('Endzeit')");

    // compare status box entry is not the same like before indexing
    cy.get('div.status').invoke('text').should('not.equal', statusEntry);
  });

  it('Set a cron expression and check', () => {
    const cron = '*/10 * * * * *';

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();
    cy.get('mat-form-field input').clear().type(cron);

    cy.get('mat-hint').contains('Alle 10 Sekunden');

    cy.get('button').contains('Übernehmen').click();
    DocumentPage.waitUntilElementIsVisible("div.status:contains('Endzeit')");

    cy.get('button').contains('Keine zeitliche Indizierung').click();
  });

  it('Set cron expression via example buttons', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);

    cy.get('mat-chip').contains('Alle 30 Minuten').click();

    cy.get('mat-hint').contains('Alle 30 Minuten');
  });

  it('Only index published documents', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();

    cy.get('button').contains('Indizieren').click();
    DocumentPage.waitUntilElementIsVisible("div.status:contains('Endzeit')");

    cy.get('div.status')
      .contains('Anzahl Dokumente')
      .invoke('text')
      .then(text => {
        const fullText = text;
        const pattern = /[0-9]+/g;
        const number = fullText.match(pattern);
        cy.log('Anzahl der indexierten Dokumente: ' + number);

        DocumentPage.CreateFullMcloudDocumentWithAPI('Published_mCloudDoc_Indextest', true);

        cy.get('button').contains('Indizieren').click();
        DocumentPage.waitUntilElementIsVisible("div.status:contains('Endzeit')");

        cy.get('div.status')
          .contains('Anzahl Dokumente')
          .invoke('text')
          .then(text => {
            const fullText2 = text;
            const number2 = fullText2.match(pattern);
            cy.log('Anzahl der indexierten Dokumente: ' + number2);

            // compare number of indexed objects
            assert.notEqual(number2, number, number2 + ' ' + number + ' are not equal');
          });
      });
  });
});
