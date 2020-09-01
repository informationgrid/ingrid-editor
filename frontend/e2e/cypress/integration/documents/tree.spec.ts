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
    cy.get('#sidebar').findByText('Testdokumente').click();
    cy.get('#sidebar').findByText('Ordner 2. Ebene').click();
    cy.get('#sidebar').contains('Tiefes Dokument').click();
    cy.get('.navigation-header').contains('Zeitbezüge').click();
    // needs to check up that the screen is on point Zeitbezüge
  });
  
  it('should expand and select the same node when reloading page', () => {
    cy.get('#sidebar').findByText('Testdokumente').click();
    cy.get('#sidebar').findByText('Ordner 2. Ebene').click();

    CopyCutUtils.selectNodeWithChecks('Ordner 2. Ebene', ['Daten', 'Testdokumente']);

    cy.reload();

    CopyCutUtils.selectNodeWithChecks('Ordner 2. Ebene', ['Daten', 'Testdokumente']);
  });

  it('should show search results in tree search', () => {
    cy.get('[data-cy=tree-search-field]').type('Tiefes Dokument');
    cy.get('#mat-autocomplete-0').contains('Tiefes Dokument');
  });

  it('should show empty search input field when clicking on x-button', () => {
    cy.get('[data-cy=tree-search-field]').type('Test');
    cy.get('#mat-autocomplete-0').contains('Test');

    cy.get('[data-cy=clear-tree-search-field]').click();

    // if dropdown is not visible, tree-search-field is empty
    cy.get('#mat-autocomplete-0').should('not.visible');
    cy.get('#mat-input-0').should('be.empty');
  });

  describe('Copy', () => {
    it('should not be possible to copy a node under itself', () => {
      const docName = 'copy into myself0';

      DocumentPage.createDocument(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('#mat-dialog-1').should('not.contain.value', docName);
    });

    it('should not be possible to copy a node inside a folder into the same one', () => {
      // Bug #2064
      const testFolder = 'copy into myself1';
      const testFolder2 = 'copy into myself2';

      DocumentPage.createFolder(testFolder);
      DocumentPage.createFolder(testFolder2);

      cy.get('#sidebar').contains(testFolder).click();

      CopyCutUtils.copyObjectWithTree(testFolder, testFolder2);
      cy.get('error-dialog').contains('Copy Error');
      cy.get('[data-cy=error-dialog-close]').click();
    });

    it('should not be possible to copy a document/folder under a document', () => {
      // only folders can contain sub-elements
      const docName = 'root doc';
      const testFolder = 'folder: copy me under a doc';
      const docName2 = 'doc: copy me under a doc';

      DocumentPage.createDocument(docName);
      DocumentPage.createDocument(docName2);
      DocumentPage.createFolder(testFolder);

      cy.get('#sidebar').findByText(docName2).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('#mat-dialog-3').should('not.contain.value', docName);

      cy.get('#mat-dialog-3').type('{esc}');

      cy.get('#sidebar').findByText(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('#mat-dialog-4').should('not.contain.value', docName);
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

      // checkPath if root tree is copied in a sub folder
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

    it('should copy a root folder (without sub-tree) into a folder', () => {
      const testFolder = 'copy me into a folder2'

      DocumentPage.createFolder(testFolder);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Kopieren').click();
      cy.get('#mat-dialog-1').findByText('Testdokumente').click();
      cy.get('[data-cy=create-applyLocation]').click();

      CopyCutUtils.selectNodeWithChecks(testFolder,['Daten', 'Testdokumente']);
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

      // delete docName document and testFolder
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      Tree.containsNodeWithTitle(docName);
      cy.get('[data-cy=toolbar_DELETE]').click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();
      // refresh page after deleting document to stabilize test (if we do not this, we got an error and can not delete testFolder)
      DocumentPage.visit();
      cy.get('#sidebar').contains(testFolder).click();
      cy.get('[data-cy=toolbar_DELETE]').click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();

      // checkPath if root tree is copied in a sub folder
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

      // to close Testdokumente
      cy.get('#sidebar').findByText('Testdokumente').click();

      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });
  });

  describe('Cut', () => {
    it('should be possible to move a root node under the root node', () => {
      // at the moment it's allowed since there's no harm
      const testFolder = 'move me under the root node'
      const docName = 'document at level 2'

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      // Check path
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-2').findByText('Daten').click();
      cy.get('[data-cy=create-applyLocation]').click();

      DocumentPage.visit();

      cy.get('#sidebar').contains(testFolder).click();
      cy.get('#sidebar').contains(docName).click();
      // check if path is the same like before
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should be possible to move a node inside a folder into the same one', () => {
      // at the moment it's allowed since there's no harm
      const testFolder = 'move me up'

      cy.get('#sidebar').findByText('Testdokumente').click();
      DocumentPage.createFolder(testFolder);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-1').findByText('Testdokumente').click();
      cy.get('[data-cy=create-applyLocation]').click();

      CopyCutUtils.selectNodeWithChecks(testFolder, ['Daten', 'Testdokumente']);
    });

    it('should move a root document into a folder', () => {
      const docName = 'move me into a folder'

      DocumentPage.createDocument(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-1').findByText('Testdokumente').click();
      cy.get('[data-cy=create-applyLocation]').click();

      DocumentPage.visit();

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
    });

    it('should move a root document into a deeply nested folder', () => {
      const docName = 'move me into a deep folder'

      DocumentPage.createDocument(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-1').findByText('Testdokumente').click();
      cy.wait(500) //TODO delete when better selector is found
      cy.get('ige-tree mat-tree mat-tree-node div').contains('Ordner 2. Ebene').click();
      cy.get('[data-cy=create-applyLocation]').click();

      DocumentPage.visit();

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains('Ordner 2. Ebene').click();
      cy.get('#sidebar').contains(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
    });

    it('should move a document from a folder to the root', () => {
      const docName = 'move me from a deep folder'

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').contains('Ordner 2. Ebene').click();

      DocumentPage.createDocument(docName);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-1').findByText('Daten').click();
      cy.wait(500) //TODO delete when better selector is found
      cy.get('[data-cy=create-applyLocation]').click();

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);
    });

    it('should move a root folder into a folder', () => {
      const testFolder = 'move me';
      const testFolder2 = 'move me2';
      const docName = 'iam under a moved folder'

      DocumentPage.createFolder(testFolder);
      DocumentPage.createFolder(testFolder2);
      DocumentPage.createDocument(docName);

      cy.get('#sidebar').contains(testFolder).click();

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
      cy.get('#mat-dialog-3').findByText('Testdokumente').click();
      cy.get('[data-cy=create-applyLocation]').click();

      DocumentPage.visit();

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').findByText(testFolder).click();
      cy.get('#sidebar').findByText(testFolder2).click();
      cy.get('#sidebar').findByText(docName).click();
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', testFolder, testFolder2]);
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
  });

  describe('DragnDrop', () => {

    it('should move a document into an opened folder', () => {
      const docName = 'drag&drop to a folder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      cy.get('#sidebar').contains(docName).click();

      // drag&drop
      cy.get('#sidebar').contains(docName).trigger('dragstart', { dataTransfer: new DataTransfer });
      cy.get('#sidebar').findByText('Neue Testdokumente').eq(0).trigger('drop');
      cy.get('[data-cy=confirm-dialog-confirm]').click();

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Neue Testdokumente']);
    });

    it('should move a document into a deeply nested folder with hovered node', () => {
      const docName = 'drag&drop to a deep folder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      cy.get('#sidebar').contains(docName).click()
        .trigger('dragstart', { dataTransfer: new DataTransfer })
      cy.get('#sidebar').findByText('Testdokumente')
        .trigger('dragover', { dataTransfer: DataTransfer}).click()
      cy.get('#sidebar').findByText('Ordner 2. Ebene')
        .trigger('dragover', { dataTransfer: DataTransfer}).click()
        .trigger('drop')

      cy.get('[data-cy=confirm-dialog-confirm]').click();

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
    });

    it('should move a document into a not expanded node (other children should be there)', () => {
      // when we drop the document before the folder is expanded, then it happened the new moved node was the only
      // one under the parent folder

      const docName = 'drag&drop to a node'

      DocumentPage.createDocument(docName);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      cy.get('#sidebar').contains(docName).click();

      cy.get('#sidebar').contains(docName).trigger('dragstart', { dataTransfer: new DataTransfer });
      cy.get('#sidebar').findByText('Testdokumente').eq(0).trigger('drop');
      cy.get('[data-cy=confirm-dialog-confirm]').click();
      // when dragging a node onto a folder, the folder expands automatically after a few milliseconds
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
      // chek if other expected children are available under destination folder
      CopyCutUtils.selectNodeWithChecks('Ordner 2. Ebene', ['Daten', 'Testdokumente']);
    });

    xit('should move a document into a deeply nested folder by auto-expanding of hovered node', () => {
      //cypress dont open a hovered node by auto-expanding
    });
  });


});
