import {DocumentPage} from "../../pages/document.page";
import {CopyCutUtils} from "../../pages/copy-cut-utils";
import {Tree} from "../../pages/tree.partial";
import {enterTestDataSteps} from "../../pages/enterTestDataSteps";
import {Utils} from "../../pages/utils";

before(() => {
  cy.kcLogin('user');
});

beforeEach(() => {
  cy.visit('form');
});

describe('Tree', () => {

  xit('should navigate to a section when clicking on form header navigation', () => {
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', 'Tiefes Dokument']);

    cy.get('.navigation-header').contains('Zeitbezüge').click();
    // needs to check up that the screen is on point Zeitbezüge
  });

  it('should expand and select the same node when reloading page', () => {
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene']);
    CopyCutUtils.selectNodeWithChecks('Ordner 2. Ebene', ['Daten', 'Testdokumente']);

    DocumentPage.refreshDashboard();
    // when 'Ordner 2. Ebene is visible, the other folders are expanded
    Tree.containsNodeWithTitle('Ordner 2. Ebene');
  });

  it('should show search results in tree search', () => {
    DocumentPage.search('Tiefes Dokument');
    DocumentPage.getSearchResults().contains('Tiefes Dokument');
  });

  it('should show empty search input field when clicking on x-button', () => {
    DocumentPage.search('Test');
    DocumentPage.getSearchResults().contains('Test');
    cy.get('[data-cy=clear-tree-search-field]').click();

    cy.get(DocumentPage.treeSearchBar).should('be.empty');
  });

  describe('DragnDrop', () => {

    it('should move a document into an opened folder', () => {
      const docName = 'drag&drop to a folder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      CopyCutUtils.dragdropWithoutAutoExpand(docName, 'Neue Testdokumente', true);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Neue Testdokumente']);
    });

    it('should move a document into a deeply nested folder with hovered node', () => {
      const docName = 'drag&drop to a deep folder'
      const deepFolder = 'Folder'
      const deepFolder2 = 'deep Folder'
      const deepFolder3 = 'deeper Folder'

      DocumentPage.createDocument(docName);
      DocumentPage.createFolder(deepFolder);
      DocumentPage.createFolder(deepFolder2);
      DocumentPage.createFolder(deepFolder3);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      CopyCutUtils.dragdrop(docName, [deepFolder, deepFolder2, deepFolder3], true);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', deepFolder, deepFolder2, deepFolder3]);
    });

    it('should move a document into a not expanded node (other children should be there)', () => {
      // when we drop the document before the folder is expanded, then it happened the new moved node was the only
      // one under the parent folder

      const docName = 'drag&drop to a node'

      DocumentPage.createDocument(docName);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      CopyCutUtils.dragdropWithoutAutoExpand(docName, 'Testdokumente', true);

      // when dragging a node onto a folder, the folder expands automatically after a few milliseconds
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
      // chek if other expected children are available under destination folder
      CopyCutUtils.selectNodeWithChecks('Ordner 2. Ebene', ['Daten', 'Testdokumente']);
    });

    it('should move a document into a deeply nested folder by auto-expanding of hovered node', () => {
      //cypress dont open a hovered node by auto-expanding
      const docName = 'drag&drop to a deep node (auto-expand)'
      const dropFolder ='Auto-expanding1'
      const dropFolder2 ='Auto-expanding2'

      DocumentPage.createDocument(docName);
      DocumentPage.createFolder(dropFolder);
      DocumentPage.createFolder(dropFolder2);

      //to close for checking auto-expanding by hovered node
      Tree.selectNodeWithTitle(dropFolder);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);

      CopyCutUtils.dragdrop(docName, [dropFolder, dropFolder2], true);

      //check if document is moved
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', dropFolder, dropFolder2]);
    });

    it('should auto-expand a deeply nested folder', () =>{
      const docName ='Tester deep auto-expand'
      const docName2 = 'Deep deep folder'
      const deepFolder ='Deep auto-expanding1'
      const deepFolder2 ='Deep auto-expanding2'

      DocumentPage.createDocument(docName);
      DocumentPage.createFolder(deepFolder);
      DocumentPage.createFolder(deepFolder2);
      DocumentPage.createDocument(docName2);

      // to close for checking auto-expanding by hovered node
      Tree.selectNodeWithTitle(deepFolder);

      CopyCutUtils.dragdrop(docName, [deepFolder, deepFolder2, docName2], false);

      //check if nodes are expanded
      CopyCutUtils.selectNodeWithChecks(docName2, ['Daten', deepFolder, deepFolder2]);
    });
  });

  describe('Copy', () => {

    it('should not be possible to copy a node under itself', () => {
      const docName = 'copy into myself0';

      DocumentPage.createDocument(docName);

      // because of 'not.contain.value' we can not use CopyCutUtils.copyObject()
      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[data-cy=copyMenu_COPY]').click();
      cy.get('.mat-dialog-content').should('not.contain.value', docName);
    });

    it('should not be possible to copy a node inside a folder into the same one (#2064)', () => {
      const testFolder = 'copy into myself1';
      const testFolder2 = 'copy into myself2';

      DocumentPage.createFolder(testFolder);
      DocumentPage.createFolder(testFolder2);

      CopyCutUtils.selectNodeWithChecks(testFolder, ['Daten']);

      CopyCutUtils.copyObjectWithTree([testFolder, testFolder2]);
      cy.get('error-dialog').find('[data-cy=error-dialog-title]').contains('Fehler');
    });

    it('should not be possible to copy a document/folder under a document', () => {
      // only folders can contain sub-elements
      const docName = 'root doc';
      const testFolder = 'folder: copy me under a doc';
      const docName2 = 'doc: copy me under a doc';

      DocumentPage.createDocument(docName);
      DocumentPage.createDocument(docName2);
      DocumentPage.createFolder(testFolder);

      CopyCutUtils.selectNodeWithChecks(docName2, ['Daten']);

      // because of 'not.contain.value' we can not use CopyCutUtils.copyObject()
      cy.get('[data-cy=toolbar_COPY]').click()
        .get('[data-cy=copyMenu_COPY]').click();
      cy.get('.mat-dialog-content').should('not.contain.value', docName);

      cy.get('.mat-dialog-content').type('{esc}');

      Tree.selectNodeWithTitle(testFolder);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[data-cy=copyMenu_COPY]').click();
      cy.get('.mat-dialog-content').should('not.contain.value', docName);
    });

    it('should copy a root document into a folder', () => {
      const docName = 'copy me into a folder';

      DocumentPage.createDocument(docName);
      Tree.containsNodeWithTitle(docName);

      CopyCutUtils.copyObject(['Testdokumente'])

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
    });

    it('should copy a root document into a deeply nested folder', () => {
      const docName = 'copy me to a deepfolder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.copyObject(['Testdokumente', 'Ordner 2. Ebene']);
      DocumentPage.deleteLoadedNode();

      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene']);
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
    });

    it('should copy a document from a folder to the root', () => {
      const docName = 'copy me to the root';

      Tree.selectNodeWithTitle('Neue Testdokumente');

      // TODO: Use API-call instead of entering data manually
      DocumentPage.createDocument(docName);
      enterTestDataSteps.enterFullDataInMcloudDoc();
      DocumentPage.saveDocument();

      CopyCutUtils.copyObject();

      Tree.selectNodeWithTitle('Neue Testdokumente');
      CopyCutUtils.selectNodeWithChecks(docName,['Daten']);
    });

    it('should copy a root folder (without sub-tree) into a folder', () => {
      const testFolder = 'copy me into a folder2'

      DocumentPage.createFolder(testFolder);

      CopyCutUtils.copyObject(['Testdokumente']);
      //DocumentPage.deleteLoadedNode();

      CopyCutUtils.selectNodeWithChecks(testFolder,['Daten', 'Testdokumente']);
    });

    it('should copy a root folder (with sub-tree) into a folder', () => {
      const docName = 'copy me from a folder ';
      const testFolder = 'iam root';

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
      CopyCutUtils.copyObject();
      CopyCutUtils.checkPath(['Daten', testFolder]);
      DocumentPage.deleteLoadedNode();

      DocumentPage.search(docName);
      DocumentPage.getSearchResult().click();

      CopyCutUtils.checkPath(['Daten']);
    });

    it('should copy a root tree to a sub folder', () => {
      const testFolder = 'copy me to a subfolder';
      const docName = 'iam under a folder'

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.copyObjectWithTree(['Testdokumente', 'Ordner 2. Ebene']);

      Tree.openNode([testFolder]);
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);

      // Bug/Feature #2115: empty folders cannot be deleted
      Tree.selectNodeWithTitle(docName);
      DocumentPage.deleteLoadedNode();
      cy.wait(300);
      Tree.selectNodeWithTitle(testFolder);
      DocumentPage.deleteLoadedNode();

      Tree.openNode([ 'Testdokumente', 'Ordner 2. Ebene', testFolder]);

      // TODO: the function "selectNodeWithChecks" does not belong to CopyCutUtils, right?
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene', testFolder]);
    });

    it('should copy a tree inside a folder to root', () => {
      const testFolder = 'copy me from a subfolder';
      const docName = 'iam under a folder'

      Tree.selectNodeWithTitle('Testdokumente');

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.copyObjectWithTree();

      Tree.selectNodeWithTitle('Testdokumente');
      Tree.openNode([testFolder]);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });
  });

  describe('Cut', () => {

    it('should be possible to move a root node under the root node', () => {
      // at the moment it's allowed since there's no harm
      const testFolder = 'move me under root node ' + Utils.randomString()
      const docName = 'document level 2 ' + Utils.randomString()

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      // Check path
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);

      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move();

      // wait a bit after move so that we use the right dom state
      cy.wait(200);

      Tree.openNode([testFolder, docName]);

      // check if path is the same like before
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should be possible to move a node inside a folder into the same one', () => {
      // at the moment it's allowed since there's no harm
      const testFolder = 'move me into the same folder'

      Tree.selectNodeWithTitle('Testdokumente');
      DocumentPage.createFolder(testFolder);

      CopyCutUtils.move(['Testdokumente']);

      CopyCutUtils.selectNodeWithChecks(testFolder, ['Daten', 'Testdokumente']);
    });

    it('should move a root document into a folder', () => {
      const docName = 'move me into a folder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.move(['Testdokumente']);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente']);
    });

    it('should move a root document into a deep folder', () => {
      const docName = 'move me into a deep folder'

      DocumentPage.createDocument(docName);

      CopyCutUtils.move(['Testdokumente', 'Ordner 2. Ebene']);

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
    });

    it('should move a root folder into a deep folder', () => {
      const testFolder = 'move me to a deep folder';

      DocumentPage.createFolder(testFolder);

      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move(['Testdokumente', 'Ordner 2. Ebene']);

      CopyCutUtils.selectNodeWithChecks(testFolder, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
    });

    it('should move a document from a folder to the root', () => {
      const docName = 'move me from a deep folder'

      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene']);

      DocumentPage.createDocument(docName);
      CopyCutUtils.move();

      CopyCutUtils.selectNodeWithChecks(docName, ['Daten']);
    });

    it('should move a root folder into a folder', () => {
      // Bug #2091
      const testFolder = 'move me1';

      DocumentPage.createFolder(testFolder);

      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move(['Testdokumente']);

      CopyCutUtils.selectNodeWithChecks(testFolder, ['Daten', 'Testdokumente']);
    });

    it('should move a node within a folder to the root', () => {
      const testFolder = 'move me from a folder';
      const docName = 'iam under a folder'

      Tree.selectNodeWithTitle('Testdokumente');

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move();

      Tree.openNode([testFolder]);
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });

    it('should move a folder with sub-tree without splitting them (#2091)', () => {
      const testFolder = 'move me ' + Utils.randomString();
      const docName = 'level two ' + Utils.randomString();

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);

      // move from root to root
      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move();

      // wait a bit after move so that we use the right dom state
      cy.wait(200);

      Tree.openNode([testFolder, docName]);
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);

      // move from root to a folder
      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move(['Neue Testdokumente']);

      // wait a bit after move so that we use the right dom state
      cy.wait(200);

      Tree.openNode(['Neue Testdokumente', testFolder, docName]);
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', 'Neue Testdokumente', testFolder]);

      // move from a folder to root
      Tree.selectNodeWithTitle(testFolder);
      CopyCutUtils.move();

      // wait a bit after move so that we use the right dom state
      cy.wait(200);

      Tree.openNode([testFolder, docName]);
      CopyCutUtils.selectNodeWithChecks(docName, ['Daten', testFolder]);
    });
  });
});
