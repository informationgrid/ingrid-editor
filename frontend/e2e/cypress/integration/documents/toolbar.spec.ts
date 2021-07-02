import { DocumentPage } from '../../pages/document.page';
import { Tree } from '../../pages/tree.partial';

describe('Toolbar behavior', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('/form');
    cy.get('mat-toolbar').should('be.visible');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('initially only create folder and create doc are enabled', () => {
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder']);
  });

  it('should activate specific buttons when a folder is loaded', () => {
    const testFolder = 'checkDisabledBtn';

    DocumentPage.createFolder(testFolder);

    // Empty folder
    Tree.openNode(['checkDisabledBtn']);
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save']);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled');
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');

    // Non Empty folder
    cy.get('body').type('{esc}');
    Tree.openNode(['Testdokumente']);
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Previous']);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.enabled');
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });

  it('should activate specific buttons when a document is loaded', () => {
    Tree.openNode(['Testdokumente']);
    cy.get('#sidebar').findByText('Test mCLOUD Dokument').click();
    DocumentPage.checkOnlyActiveToolbarButtons([
      'NewDoc',
      'NewFolder',
      'Copy',
      'Delete',
      'Save',
      'Publish',
      'Previous'
    ]);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled'); // only folders
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });

  it('should activate specific buttons when a published document is loaded', () => {
    Tree.openNode(['Neue Testdokumente', 'Published_mCloudDoc_Indextest']);
    DocumentPage.checkOnlyActiveToolbarButtons([
      'NewDoc',
      'NewFolder',
      'Copy',
      'Delete',
      'Save',
      'Publish',
      'Previous'
    ]);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get('[data-cy=copyMenu_COPY]').should('be.enabled');
    cy.get('[data-cy=copyMenu_COPYTREE]').should('be.disabled'); // only folders
    cy.get('[data-cy=copyMenu_CUT]').should('be.enabled');
  });

  xit('should activate specific buttons when a published document with draft is loaded', () => {
    Tree.openNode(['published with working']);
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Revert', 'Delete', 'Save', 'Publish']);
  });
});
