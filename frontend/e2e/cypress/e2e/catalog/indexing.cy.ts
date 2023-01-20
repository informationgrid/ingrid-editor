import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../pages/base.page';
import { DocumentPage } from '../../pages/document.page';
import { IndexingPage } from '../../pages/indexing.page';
import { CodelistPage } from '../../pages/codelist.page';

describe('Indexing', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    CodelistPage.visit();
  });

  it('Index and check indexed object counter has increased', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);

    // the very first time no status is visible
    // cy.get('.main-header .menu-button').should('not.exist');

    IndexingPage.indexAndWait();
    cy.get('.main-header .menu-button').should('exist');

    // also check that content of status changes
    IndexingPage.openIndexStatusBox();
    const statusEntry = cy.get('div.status').invoke('text');

    // wait a bit after last indexing
    cy.wait(1000);
    IndexingPage.indexAndWait();
    // compare status box entry is not the same like before indexing
    cy.get('div.status').invoke('text').should('not.equal', statusEntry);
  });

  it('Set a cron expression and check', () => {
    const cron = '*/10 * * * * *';

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    IndexingPage.openIndexStatusBox();
    IndexingPage.getStatusContent().then(previousContent => {
      cy.get('mat-form-field input').clear().type(cron);

      cy.get('mat-hint').contains('Alle 10 Sekunden');

      cy.get('button').contains('Übernehmen').click();
      cy.get('div.status', { timeout: 20000 }).should('not.contain', previousContent);
      cy.get('div.status', { timeout: 20000 }).should('contain', 'Endzeit');

      cy.get('button').contains('Keine zeitliche Indizierung').click();
    });
  });

  it('Set cron expression via example buttons', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    const cronExampleText = 'Alle 30 Minuten';

    cy.get('mat-hint').should('not.contain', cronExampleText);
    cy.wait(300);
    cy.get('mat-chip').contains(cronExampleText).click();
    cy.contains('mat-hint', cronExampleText, { timeout: 6000 });
    cy.get('button').contains('Übernehmen').click();
    cy.get('mat-hint').contains(cronExampleText);
  });

  it('Only index published documents', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);

    IndexingPage.indexAndWait();
    IndexingPage.openIndexStatusBox();

    cy.get('.status span[data-cy=count-documents]')
      .invoke('text')
      .then(number => {
        cy.log('Anzahl der indizierten Dokumente: ' + number);

        DocumentPage.CreateFullMcloudDocumentWithAPI('Published_mCloudDoc_Indextest', true);

        IndexingPage.indexAndWait();

        cy.get('.status span[data-cy=count-documents]')
          .invoke('text')
          .then(number2 => {
            cy.log('Anzahl der indizierten Dokumente: ' + number2);

            // compare number of indexed objects
            assert.notEqual(number2, number, number2 + ' ' + number + ' are not equal');
          });
      });
  });
});
