import { DocumentPage } from '../../pages/document.page';
import { Tree } from '../../pages/tree.partial';

describe('Toolbar behavior', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    cy.visit('/form');
    cy.get('mat-toolbar', { timeout: 10000 }).should('be.visible');
  });

  it('initially only create folder and create doc are enabled', () => {
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder']);
  });

  it('should activate specific buttons when a folder is loaded', () => {
    const testFolder = 'checkDisabledBtn';

    DocumentPage.createFolder(testFolder);

    // Empty folder
    Tree.openNode(['checkDisabledBtn']);
    // ignore preview button for now for now
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save'], ['Preview']);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled');
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');

    // Non Empty folder
    cy.get('body').type('{esc}');
    Tree.openNode(['Testdokumente']);
    // ignore preview button for now for now
    DocumentPage.checkOnlyActiveToolbarButtons(
      ['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Previous'],
      ['Preview']
    );
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.enabled');
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });

  it('should activate specific buttons when a document is loaded', () => {
    Tree.openNode(['Testdokumente']);
    cy.get('#sidebar').findByText('Test mCLOUD Dokument').click();
    DocumentPage.checkOnlyActiveToolbarButtons(
      ['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Publish', 'Previous', 'Preview'],
      ['PublishNow']
    );
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled'); // only folders
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });

  it('should activate specific buttons when a published document is loaded', () => {
    const docTitle = 'tstPublished_mCloudDoc_ToolbarTest';
    // create a published doc to be checked
    DocumentPage.CreateFullMcloudDocumentWithAPI(docTitle, true);

    Tree.openNode(['Neue Testdokumente', docTitle]);
    DocumentPage.checkOnlyActiveToolbarButtons(
      ['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Publish', 'Preview'],
      ['Previous', 'PublishNow']
    );
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled'); // only folders
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });

  it('should activate specific buttons when a published document with draft is loaded', () => {
    const docTitle = 'Veröffentlichter Datensatz mit Bearbeitungsversion';
    Tree.openNode([docTitle]);
    DocumentPage.checkOnlyActiveToolbarButtons(
      ['NewDoc', 'NewFolder', 'Copy', 'Revert', 'Delete', 'Save', 'Publish', 'Preview'],
      ['PublishNow']
    );
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled'); // only folders
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });
});
