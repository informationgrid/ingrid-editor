import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../pages/base.page';
import { DocumentPage } from '../../pages/document.page';
import { IndexingPage, StatusContent } from '../../pages/indexing.page';

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

    IndexingPage.indexAndWait();

    // compare status box entry is not the same like before indexing
    cy.get('div.status').invoke('text').should('not.equal', statusEntry);
  });

  it('Set a cron expression and check', () => {
    const cron = '*/10 * * * * *';

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();
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
    cy.get('mat-hint').contains(cronExampleText);
    cy.get('button').contains('Übernehmen').click();
    cy.get('mat-hint').contains(cronExampleText);
  });

  it('Only index published documents', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();

    IndexingPage.indexAndWait();

    IndexingPage.getStatusContent(StatusContent.countDocuments).then(text => {
      const pattern = /[0-9]+/g;
      const number = text.match(pattern);
      cy.log('Anzahl der indexierten Dokumente: ' + number);

      DocumentPage.CreateFullMcloudDocumentWithAPI('Published_mCloudDoc_Indextest', true);

      IndexingPage.indexAndWait();

      IndexingPage.getStatusContent(StatusContent.countDocuments).then(text => {
        const number2 = text.match(pattern);
        cy.log('Anzahl der indexierten Dokumente: ' + number2);

        // compare number of indexed objects
        assert.notEqual(number2, number, number2 + ' ' + number + ' are not equal');
      });
    });
  });
});
