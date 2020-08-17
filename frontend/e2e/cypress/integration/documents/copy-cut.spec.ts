import {DocumentPage, SEPARATOR} from "../../pages/document.page";
import {Utils} from "../../pages/utils";
import {Tree} from "../../pages/tree.partial";
import Doc = Mocha.reporters.Doc;

describe('Copy & Cut of documents', () => {

  const dialog = DocumentPage.CreateDialog;

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  describe('Copy', () => {
    it('should copy a root node into a folder', () => {
      const docName = 'copy me into a folder';

      DocumentPage.visit();

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();

      DocumentPage.CreateDialog.setLocation('Testdokumente');

      selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
    });

    it('should copy a node within a folder to the root', () => {
      const docName = 'copy me from a folder ';
      const testFolder = 'i am at level 0';

      DocumentPage.visit();

      DocumentPage.createFolder(testFolder);
      Tree.containsNodeWithTitle(testFolder);

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('[data-cy=create-applyLocation]').click();

      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should copy a root node to the root', () => {
      const docName = 'copy me to the root';

      DocumentPage.visit();

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('[data-cy=create-applyLocation]').click();

      cy.get('#sidebar').contains(docName).click();
      cy.get('ige-breadcrumb').contains('Daten');
      cy.get('ige-header-title-row').contains(docName);
    });

    xit('should copy a root node into a deeply nested folder (which is first selected in dialog)', () => {
      // check if copied node is present by expanding tree
    });

    xit('should copy a root tree to a sub folder', () => {

    });

    xit('should copy a tree inside a folder to root', () => {

    });

    xit('cannot copy a root folder in itself', () => {

    });
  });

  describe('Cut', () => {

    xit('should not be possible to move a node under the previous parent/root', () => {

    });

    xit('should move a root node into a folder', () => {

    });

    xit('should move a node within a folder to the root', () => {

    });

    xit('should move a whole tree', () => {

    });

  });

function selectNodeWithChecks(nodeTitle: string, path: string[]){
    //Tree.selectNodeWithTitle(nodeTitle); <-- just work for level 0 nodes
    cy.get('#sidebar').contains(nodeTitle).click();
    cy.get('ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    cy.get('ige-header-title-row').contains(nodeTitle);
  }

});
