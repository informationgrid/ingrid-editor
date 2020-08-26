import {DocumentPage} from "../../pages/document.page";
import {CopyCutUtils} from "../../pages/copy-cut-utils";
import {Tree} from "../../pages/tree.partial";

describe('Tree', () => {

  before(() => {
    cy.kcLogin('user');
  });

  beforeEach(() => {
    cy.visit('form');
  });

  xit('should navigate to a section when clicking on form header navigation', () => {

  });

  // ...
  xit('should expand and select the same node when reloading page', () => {

  });

  xit('should show search results in tree search', () => {

  });

  xit('should show empty search input field when clicking on x-button', () => {

  });

  describe('Copy', () => {
    xit('should not be possible to copy a root node under the root node', () => {

    });

    it('should not be possible to copy a node inside a folder into the same one', () => {
      //Bug #2064
      const testFolder = 'copy into myself';
      const testFolder2 = 'copy into myself2';

      DocumentPage.createFolder(testFolder);
      DocumentPage.createFolder(testFolder2);

      cy.get('#sidebar').contains(testFolder).click();

      CopyCutUtils.copyObjectWithTree(testFolder, testFolder2);
      cy.get('error-dialog').contains('Copy Error');
      cy.get('[data-cy=error-dialog-close]').click();
    });

    xit('should not be possible to copy a document/folder under a document', () => {
      // only folders can contain sub-elements

      //neu
    });

    it('should copy a root document into a folder', () => {
      const docName = 'copy me into a folder';

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();

      DocumentPage.CreateDialog.setLocation('Testdokumente');

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
    });

    it('should copy a root document into a deeply nested folder', () => {
      const docName = 'copy me to a deepfolder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.copyObject('Testdokumente', 'Ordner 2. Ebene');

      cy.get('#sidebar').contains(docName).click();
      cy.get('[data-cy=toolbar_DELETE]').click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();

      //checkPath if root tree is copied in a sub folder
      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').findByText('Ordner 2. Ebene').click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
      cy.get('ige-header-title-row').contains(docName);
    });

    it('should copy a document from a folder to the root', () => {
      const docName = 'copy me to the root';

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('[data-cy=create-applyLocation]').click();

      cy.get('#sidebar').contains(docName).click();
      cy.get('ige-breadcrumb').contains('Daten');
      cy.get('ige-header-title-row').contains(docName);
    });

    xit('should copy a root folder (without sub-tree) into a folder', () => {
      //neu
    });

    it('should copy a root folder (with sub-tree) into a folder', () => {
      const docName = 'copy me from a folder ';
      const testFolder = 'i am at level 0';

      DocumentPage.createFolder(testFolder);
      Tree.containsNodeWithTitle(testFolder);

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('[data-cy=create-applyLocation]').click();

      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should copy a root tree to a sub folder', () => {
      const testFolder = 'copy me to a subfolder';
      const docName = 'iam under a folder'

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);
      cy.get('#sidebar').contains(testFolder).click();

      CopyCutUtils.copyObjectWithTree('Testdokumente', 'Ordner 2. Ebene');

      //delete docName document and testFolder
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      Tree.containsNodeWithTitle(docName);
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
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene', testFolder]);
      cy.get('ige-header-title-row').contains(docName);
    });

    it('should copy a tree inside a folder to root', () => {
      const testFolder = 'copy me from a subfolder';
      const docName = 'iam under a folder'

      cy.get('#sidebar').findByText('Testdokumente').click();
      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren mit Teilbaum').click();
      cy.get('[data-cy=create-applyLocation]').click();

      //to close Testdokumente
      cy.get('#sidebar').findByText('Testdokumente').click();

      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });
  });

  describe.only('Cut', () => {
    xit('should be possible to move a root node under the root node', () => {
      // at the moment it's allowed since there's no harm
    });

    xit('should be possible to move a node inside a folder into the same one', () => {
      // at the moment it's allowed since there's no harm

    });

    xit('should move a root document into a folder', () => {

    });

    xit('should move a root document into a deeply nested folder', () => {

    });

    xit('should move a document from a folder to the root', () => {

    });

    xit('should move a root folder into a folder', () => {

    });

    xit('should not be possible to move a node under the previous parent/root', () => {

    });

    it('should move a root node into a folder', () => {
      const testFolder = 'move me to a folder';
      const docName = 'iam under a folder'

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      CopyCutUtils.moveObject('Testdokumente', 'Ordner 2. Ebene');

      DocumentPage.visit();

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains('Ordner 2. Ebene').click();
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene', testFolder]);
    });

    it('should move a node within a folder to the root', () => {
      const testFolder = 'move me from a folder';
      const docName = 'iam under a folder'

      cy.get('#sidebar').contains('Testdokumente').click();
      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('[data-cy=create-applyLocation]').click();

      DocumentPage.visit();

      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should move a whole tree', () => {
      const testFolder = 'move me';
      const testFolder2 = 'move me2';
      const testFolder3 = 'move me3';
      const docName = 'iam under a moved folder'

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
      cy.get('#sidebar').findByText(testFolder).click();
      cy.get('#sidebar').findByText(testFolder2).click();
      cy.get('#sidebar').findByText(testFolder3).click();
      cy.get('#sidebar').findByText(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', testFolder, testFolder2, testFolder3]);
    });

  });

  describe('DragnDrop', () => {

    xit('should move a document into an opened folder', () => {

    });

    xit('should move a document into a deeply nested folder by auto-expanding of hovered node', () => {

    });

    xit('should move a document into a not expanded node (other children should be there)', () => {
      // when dragging a node onto a folder, the folder expands automatically after a few milliseconds

      // when we drop the document before the folder is expanded, then it happened the new moved node was the only
      // one under the parent folder

      // make sure that after move, all other expected children are available under the destination folder
    });


  });


});
