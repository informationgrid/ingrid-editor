import {DocumentPage} from '../../pages/document.page';
import {Tree} from '../../pages/tree.partial';

describe('Toolbar behavior', () => {

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  beforeEach(() => {
    cy.visit('/form');
    cy.get('mat-toolbar').should('be.visible');
  });

  it('initially only create folder and create doc are enabled', () => {
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder']);
  });

  it('should activate specific buttons when a folder is loaded', () => {
    const testFolder = 'checkDisabledBtn';

    DocumentPage.createFolder(testFolder);

    // Empty folder
    Tree.selectNodeWithTitle(testFolder);
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save']);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get("[aria-disabled='false']").contains("Kopieren")
    cy.get("[aria-disabled='true']").contains("Kopieren mit Teilbaum")
    cy.get("[aria-disabled='false']").contains("Verschieben (inkl. Teilbaum)")

    // Non Empty folder
    cy.get('body').type('{esc}')
    Tree.selectNodeWithTitle('Testdokumente');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Previous']);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get("[aria-disabled='false']").contains("Kopieren")
    cy.get("[aria-disabled='false']").contains("Kopieren mit Teilbaum")
    cy.get("[aria-disabled='false']").contains("Verschieben (inkl. Teilbaum)")
  });

  it('should activate specific buttons when a document is loaded', () => {
    Tree.selectNodeWithTitle('Testdokumente');
    cy.get('#sidebar').findByText('Test mCLOUD Dokument').click();
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Publish', 'Previous']);
    cy.get(DocumentPage.Toolbar.Copy).click();
    cy.get("[aria-disabled='false']").contains("Kopieren")
    cy.get("[aria-disabled='true']").contains("Kopieren mit Teilbaum")
    cy.get("[aria-disabled='false']").contains("Verschieben (inkl. Teilbaum)")
    // TODO: copy with subtree should be disabled, but copy and cut enabled
  });

  xit('should activate specific buttons when a published document is loaded', () => {
    Tree.selectNodeWithTitle('ddd');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Delete', 'Save', 'Publish']);
  });

  xit('should activate specific buttons when a published document with draft is loaded', () => {
    Tree.selectNodeWithTitle('published with working');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Copy', 'Revert', 'Delete', 'Save', 'Publish']);
  });

})
