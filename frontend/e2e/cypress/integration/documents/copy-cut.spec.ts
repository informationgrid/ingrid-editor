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

    it('should copy a root node into a deeply nested folder (which is first selected in dialog)', () => {
      const docName = 'copy me to a deepfolder'

      DocumentPage.visit();

      DocumentPage.createDocument(docName);

      copyObject('Testdokumente', 'Ordner 2. Ebene');

      cy.get('#sidebar').contains(docName).click();
      cy.get('[data-cy=toolbar_DELETE]').click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();

      //checkPath if root tree is copied in a sub folder
      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').findByText('Ordner 2. Ebene').click();
      //cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
      cy.get('ige-header-title-row').contains(docName);
    });

    it('should copy a root tree to a sub folder', () => {
      const testFolder = 'copy me to a subfolder';
      const docName = 'iam under a folder'

      DocumentPage.visit();

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);
      cy.get('#sidebar').contains(testFolder).click();

      copyObjectWithTree('Testdokumente', 'Ordner 2. Ebene');

      //delete docName document and testFolder
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      cy.get('[data-cy=toolbar_DELETE]').click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();
      //refresh page after deleting document to stabilize test (if we do not this, we got an error and can not delete testFolder)
      DocumentPage.visit();
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('[data-cy=toolbar_DELETE]').click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();

      //checkPath if root tree is copied in a sub folder
      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains('Ordner 2. Ebene').click();
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene', testFolder]);
      cy.get('ige-header-title-row').contains(docName);
    });

    it('should copy a tree inside a folder to root', () => {
      const testFolder = 'copy me from a subfolder';
      const docName = 'iam under a folder'

      DocumentPage.visit();

      cy.get('#sidebar').contains('Testdokumente').click();
      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren mit Teilbaum').click();
      cy.get('[data-cy=create-applyLocation]').click();

      //to close Testdokumente
      cy.get('#sidebar').contains('Testdokumente').click();

      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    xit('cannot copy a root folder in itself', () => {

    });
  });

  describe('Cut', () => {

    xit('should not be possible to move a node under the previous parent/root', () => {

    });

    it('should move a root node into a folder', () => {
      const testFolder = 'move me to a folder';
      const docName = 'iam under a folder'

      DocumentPage.visit();

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      moveObject('Testdokumente', 'Ordner 2. Ebene');

      DocumentPage.visit();

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains('Ordner 2. Ebene').click();
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene', testFolder]);
    });

    it('should move a node within a folder to the root', () => {
      const testFolder = 'move me from a folder';
      const docName = 'iam under a folder'

      DocumentPage.visit();

      cy.get('#sidebar').contains('Testdokumente').click();
      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('[data-cy=create-applyLocation]').click();

      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should move a whole tree', () => {
      const testFolder = 'move me';
      const testFolder2 = 'move me2';
      const testFolder3 = 'move me3';
      const docName = 'iam under a folder'

      DocumentPage.visit();

      DocumentPage.createFolder(testFolder);
      DocumentPage.createFolder(testFolder2);
      DocumentPage.createFolder(testFolder3);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-4').findByText('Testdokumente').click();
      cy.get('[data-cy=create-applyLocation]').click();

      DocumentPage.visit();

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(testFolder2).click();
      cy.get('#sidebar').contains(testFolder3).click();
      cy.get('#sidebar').contains(docName).click();
      selectNodeWithChecks(docName, ['Daten', 'Testdokumente', testFolder, testFolder2, testFolder3]);
    });

  });

function selectNodeWithChecks(nodeTitle: string, path: string[]){
    //Tree.selectNodeWithTitle(nodeTitle); <-- just work for level 0 nodes
    cy.get('#sidebar').contains(nodeTitle).click();
    cy.get('ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    cy.get('ige-header-title-row').contains(nodeTitle);
  }
function copyObjectWithTree(rootNode: string, secondNode: string){
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[aria-disabled=false]').contains('Kopieren mit Teilbaum').click();
    cy.get('#mat-dialog-2').findByText(rootNode).click();
    cy.get('ige-tree mat-tree mat-tree-node .label').contains(secondNode).click();
    cy.get('[data-cy=create-applyLocation]').click();
  }

function copyObject(rootNode: string, secondNode: string) {
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[aria-disabled=false]').contains('Kopieren').click();
    cy.get('#mat-dialog-1').findByText(rootNode).click();
    cy.get('ige-tree mat-tree mat-tree-node .label').contains(secondNode).click();
    cy.get('[data-cy=create-applyLocation]').click();
  }

function moveObject(rootNode: string, secondNode: string) {
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
    cy.get('#mat-dialog-2').findByText(rootNode).click();
    cy.get('ige-tree mat-tree mat-tree-node .label').contains(secondNode).click();
    cy.get('[data-cy=create-applyLocation]').click();
  }
});
