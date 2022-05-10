import { DocumentPage } from '../../pages/document.page';
import { CopyCutUtils } from '../../pages/copy-cut-utils';
import { Tree } from '../../pages/tree.partial';
import { Utils } from '../../pages/utils';
import { AddressPage } from '../../pages/address.page';
import { BasePage } from '../../pages/base.page';

describe('Tree', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    DocumentPage.visit();
  });

  const dragAndDropFolder = "Drag'n'Drop";

  it('should navigate to a section when clicking on form header navigation', () => {
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', 'Tiefes Dokument']);

    cy.get('[data-cy="Zeitbezug der Ressource"] ige-add-button button').should('not.be.visible');
    cy.get('.navigation-header').contains('Zeitbezüge').click();
    cy.get('[data-cy="Zeitbezug der Ressource"] ige-add-button button', { timeout: 1000 }).should('be.visible');
  });

  it('should expand and select the same node when reloading page', () => {
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene']);
    Tree.selectNodeAndCheckPath('Ordner 2. Ebene', ['Daten', 'Testdokumente']);

    cy.reload();
    cy.wait(800);
    // when 'Ordner 2. Ebene is visible, the other folders are expanded
    Tree.containsNodeWithFolderTitle('Ordner 2. Ebene');
  });

  it('should show search results in tree search', () => {
    DocumentPage.search('Tiefes Dokument');
    DocumentPage.getSearchResults().contains('Tiefes Dokument');
  });

  it('should display empty search input field when clicking on x-button', () => {
    DocumentPage.search('Test');
    DocumentPage.getSearchResults().contains('Test');
    cy.get('[data-cy=clear-tree-search-field]').click();

    cy.get(DocumentPage.treeSearchBar).should('be.empty');
  });

  describe('DragnDrop', () => {
    it('should move a document into an opened folder', () => {
      const docName = 'Doc_z';

      Tree.selectNodeAndCheckPath(docName, ['Daten']);

      CopyCutUtils.dragdropWithoutAutoExpand(docName, 'Neue Testdokumente', true);

      Tree.selectNodeAndCheckPath(docName, ['Daten', 'Neue Testdokumente']);
    });

    it('should move a published document from root path into an opened folder', () => {
      const docName = 'Published can be Moved' + Utils.randomString();

      DocumentPage.CreateFullMcloudDocumentWithAPI(docName, true, null);
      cy.reload();

      Tree.selectNodeAndCheckPath(docName, ['Daten']);

      CopyCutUtils.dragdropWithoutAutoExpand(docName, 'Neue Testdokumente', true);

      Tree.selectNodeAndCheckPath(docName, ['Daten', 'Neue Testdokumente']);

      CopyCutUtils.dragdrop(docName, ['Daten'], true);

      Tree.selectNodeAndCheckPath(docName, ['Daten']);
    });

    it('should move a document into a deeply nested folder with hovered node', () => {
      const docName = 'Doc_y';
      const deepFolder = 'Folder_m';
      const deepFolder2 = 'Folder_m_A';
      const deepFolder3 = 'Folder_m_AA';

      Tree.selectNodeAndCheckPath(docName, ['Daten']);

      CopyCutUtils.dragdrop(docName, [deepFolder, deepFolder2, deepFolder3], true);

      Tree.selectNodeAndCheckPath(docName, ['Daten', deepFolder, deepFolder2, deepFolder3]);
    });

    it('should move a multiple documents into a nested folder, move it back and redo it again', () => {
      const docName1 = 'Doc_v';
      const docName2 = 'Doc_x';
      const deepFolder = 'Folder_z';
      let documentsArray = [docName1, docName2];

      Tree.multiSelectObject('mat-tree', documentsArray);
      CopyCutUtils.dragdrop(docName1, [deepFolder], true, true);
      // move back the documents
      cy.get('mat-tree-node .mat-checkbox-layout').should('be.visible');
      documentsArray.forEach(node => {
        cy.get('mat-tree').contains(node).click();
      });
      CopyCutUtils.dragdrop(docName1, ['Daten'], true, true);

      // just move to any page and go back without reload
      AddressPage.visit();
      DocumentPage.visit();

      // move the documents again to original file
      Tree.multiSelectObject('mat-tree', documentsArray);
      CopyCutUtils.dragdrop(docName1, [deepFolder], true, true);
    });

    it('should move a document into a not expanded node (other children should be there)', () => {
      // when we drop the document before the folder is expanded, then it happened the new moved node was the only
      // one under the parent folder

      const docName = 'Doc_u';

      Tree.selectNodeAndCheckPath(docName, ['Daten']);

      // when dragging a node onto a folder, the folder expands automatically after a few milliseconds
      CopyCutUtils.dragdropWithoutAutoExpand(docName, 'Testdokumente', true);

      Tree.selectNodeAndCheckPath(docName, ['Daten', 'Testdokumente']);
      // check if other expected children are available under destination folder
      Tree.selectNodeAndCheckPath('Ordner 2. Ebene', ['Daten', 'Testdokumente']);
    });

    it('should move a document into a deeply nested folder by auto-expanding of hovered node', () => {
      // cypress don't open a hovered node by auto-expanding
      const docName = 'drag node';
      const dropFolder = 'Auto-other-expanding1';
      const dropFolder2 = 'Auto-other-expanding2';

      Tree.openNode([dragAndDropFolder]);
      DocumentPage.createDocument(docName);
      DocumentPage.createFolder(dropFolder);
      DocumentPage.createFolder(dropFolder2);

      // to close for checking auto-expanding by hovered node
      Tree.clickOnNodeWithTitle(dropFolder);

      Tree.openNode([dragAndDropFolder, docName]);

      CopyCutUtils.dragdrop(docName, [dropFolder, dropFolder2], true);
      // check if document is moved
      Tree.openNode([dragAndDropFolder, dropFolder, dropFolder2, docName]);
    });

    it('should auto-expand a deeply nested folder', () => {
      const docName = 'Doc_t';
      const deepFolder = 'Folder_q';
      const deepFolder2 = 'Folder_q_A';
      const deepFolder3 = 'Folder_q_AA';

      CopyCutUtils.dragdrop(docName, [deepFolder, deepFolder2, deepFolder3], false);

      // check if nodes are expanded
      Tree.selectNodeAndCheckPath(deepFolder3, ['Daten', deepFolder, deepFolder2]);

      // check if document has NOT been moved
      Tree.selectNodeAndCheckPath(docName, ['Daten']);
    });
  });

  describe('Copy', () => {
    it('should not be possible to copy a node under itself', () => {
      const docName = 'Doc_s';

      Tree.openNode([docName]);
      // because of 'not.contain.value' we can not use CopyCutUtils.copyObject()
      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[data-cy=copyMenu_COPY]').click();
      cy.get('.mat-dialog-content').should('not.contain.value', docName);
    });

    it('should not be possible to copy a node inside a folder into the same one (#2064)', () => {
      const testFolder = 'Folder_u';
      const testFolder2 = 'Folder_u_1';

      Tree.openNode([testFolder]);

      CopyCutUtils.copyObjectWithTree([testFolder, testFolder2]);
      cy.get('error-dialog').find('[data-cy=error-dialog-title]').contains('Fehler');
    });

    it('should not be possible to copy a document/folder under a document', () => {
      // only folders can contain sub-elements
      const docName = 'Doc_r';
      const testFolder = 'Folder_w';
      const docName2 = 'Doc_q';

      Tree.selectNodeAndCheckPath(docName2, ['Daten']);

      // because of 'not.contain.value' we can not use CopyCutUtils.copyObject()
      cy.get('[data-cy=toolbar_COPY]').click().get('[data-cy=copyMenu_COPY]').click();
      cy.get('.mat-dialog-content').should('not.contain.value', docName);

      cy.get('.mat-dialog-content').type('{esc}');

      Tree.openNode([testFolder]);

      cy.get('[data-cy=toolbar_COPY]').click();
      cy.get('[data-cy=copyMenu_COPY]').click();
      cy.get('.mat-dialog-content').should('not.contain.value', docName);
    });

    it('should copy a root document into a folder', () => {
      const docName = 'Doc_p';

      Tree.openNode([docName]);

      let newDocUrl;
      return cy.url().then(url => {
        // remember URL from created document
        newDocUrl = url;

        CopyCutUtils.copyObject(['Testdokumente']);

        // selected document should not have changed!
        Tree.checkPath(['Daten']);
        cy.url().should('equal', newDocUrl);

        // check if document was copied
        Tree.openNode(['Testdokumente', docName]);
      });
    });

    it('should copy a root document into a deeply nested folder', () => {
      const docName = 'Doc_o';

      Tree.openNode([docName]);

      CopyCutUtils.copyObject(['Testdokumente', 'Ordner 2. Ebene']);

      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', docName]);
    });

    it('should copy a document from a folder to the root', () => {
      const docName = 'copy me to the root';

      DocumentPage.CreateFullMcloudDocumentWithAPI(docName, false);

      Tree.openNode(['Neue Testdokumente', docName]);
      CopyCutUtils.copyObject();

      Tree.openNode([docName]);
    });

    it('should copy a root folder (without sub-tree) into a folder', () => {
      // choose folder that contains child node
      const testFolder = 'Folder_t';

      Tree.openNode([testFolder]);

      CopyCutUtils.copyObject(['Testdokumente']);

      Tree.selectNodeAndCheckPath(testFolder, ['Daten']);

      // check if document was copied
      Tree.openNode(['Testdokumente', testFolder]);

      // check if sub-tree was not copied
      Tree.checkSelectedNodeHasNoChildren();
    });

    it('should copy a root folder (with sub-tree) into a folder', () => {
      const docName = 'doc_s_1';
      const testFolder = 'Folder_s';

      Tree.openNode([testFolder]);

      CopyCutUtils.copyObjectWithTree(['Testdokumente']);

      // after copy the same original node should be active
      Tree.checkPath(['Daten']);

      // check if document was copied
      Tree.openNode(['Testdokumente', testFolder]);

      // check if sub-tree was also copied
      Tree.checkNodeHasChildren(testFolder);
      Tree.openNode(['Testdokumente', testFolder, docName]);
    });

    it('should copy a root tree to a sub folder', () => {
      // choose non-empty folder
      const testFolder = 'Folder_r';

      Tree.openNode([testFolder]);
      CopyCutUtils.copyObjectWithTree(['Testdokumente', 'Ordner 2. Ebene']);

      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', testFolder]);
    });

    it('should copy a tree inside a folder to root', () => {
      const testFolder = 'Ordner_2_A';
      const docName = 'Doc_2A_1';

      Tree.openNode(['Testdokumente', testFolder]);
      CopyCutUtils.copyObjectWithTree();

      Tree.openNode([testFolder, docName]);
    });
  });

  describe('Cut', () => {
    it('should be possible to move a root node under the root node', () => {
      // at the moment it's allowed since there's no harm
      const testFolder = 'Folder_j';
      const docName = 'Doc_j_1';

      Tree.openNode([testFolder]);
      CopyCutUtils.move();

      // wait a bit after move so that we use the right dom state
      cy.wait(200);

      Tree.openNode([testFolder, docName]);

      // check if path is the same like before
      Tree.selectNodeAndCheckPath(docName, ['Daten', testFolder]);
    });

    it('should be possible to move a node inside a folder into the same one', () => {
      // at the moment it's allowed since there's no harm
      const testFolder = 'Ordner_2_C';

      Tree.openNode(['Testdokumente', testFolder]);

      CopyCutUtils.move(['Testdokumente']);

      Tree.selectNodeAndCheckPath(testFolder, ['Daten', 'Testdokumente']);
    });

    it('should move a root document into a folder', () => {
      const docName = 'Doc_p';

      Tree.openNode([docName]);

      CopyCutUtils.move(['Testdokumente']);

      Tree.selectNodeAndCheckPath(docName, ['Daten', 'Testdokumente']);
    });

    it('should move a root document into a deep folder', () => {
      const docName = 'Doc_n';

      Tree.openNode([docName]);

      CopyCutUtils.move(['Testdokumente', 'Ordner 2. Ebene']);

      Tree.selectNodeAndCheckPath(docName, ['Daten', 'Testdokumente', 'Ordner 2. Ebene']);
    });

    it('should move a root folder into a deep folder', () => {
      const testFolder = 'Folder_n';

      Tree.openNode([testFolder]);
      CopyCutUtils.move(['Testdokumente', 'Ordner 2. Ebene']);

      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', testFolder]);
    });

    it('should move a document from a folder to the root', () => {
      const docName = 'Doc_2B_1';

      Tree.openNode(['Testdokumente', 'Ordner_2_B', docName]);

      CopyCutUtils.move();

      Tree.selectNodeAndCheckPath(docName, ['Daten']);
    });

    it('should move a root folder into a folder', () => {
      // Bug #2091
      const testFolder = 'Folder_f';

      Tree.openNode([testFolder]);
      CopyCutUtils.move(['Testdokumente']);

      Tree.selectNodeAndCheckPath(testFolder, ['Daten', 'Testdokumente']);
    });

    it('should move a node within a folder to the root', () => {
      const testFolder = 'move me from a folder';
      const docName = 'i am under a folder';

      Tree.openNode(['Testdokumente']);

      DocumentPage.createFolder(testFolder);
      DocumentPage.createDocument(docName);
      Tree.checkPath(['Daten', 'Testdokumente', testFolder]);

      Tree.openNode(['Testdokumente', testFolder]);
      CopyCutUtils.move();

      Tree.openNode([testFolder, docName]);
    });

    it('should move a folder with sub-tree without splitting them (#2091)', () => {
      const testFolder = 'Folder_k';
      const docName = 'Folder_k_A';

      Tree.openNode([testFolder, docName]);
      Tree.selectNodeAndCheckPath(docName, ['Daten', testFolder]);

      // move from root to a folder
      Tree.openNode([testFolder]);
      CopyCutUtils.move(['Neue Testdokumente']);

      Tree.openNode(['Neue Testdokumente', testFolder, docName]);

      // move from a folder to root
      Tree.openNode(['Neue Testdokumente', testFolder]);

      CopyCutUtils.move();

      Tree.openNode([testFolder, docName]);
    });
  });

  describe('Multi-Selection', () => {
    it('should show a checkbox for each node when edit mode is enabled and hide them if disabled', () => {
      cy.get('mat-tree-node .mat-checkbox-layout').should('not.exist');
      Tree.activateMultiSelectMode();
      Tree.checkMultiSelectCheckboxIsVisible();
      Tree.deactivateMultiSelectMode();
      Tree.checkMultiSelectCheckboxNotExist();
    });

    it('should preselect the opened document', () => {
      Tree.selectNodeAndCheckPath('Neue Testdokumente', ['Daten']);
      Tree.activateMultiSelectMode();
      Tree.checkMultiSelectCheckboxIsVisible();
      Tree.checkboxSelected('Neue Testdokumente');
    });

    it('should only allow options to cut, copy and delete nodes in multi select mode', () => {
      const title = 'multi-select-toolbar-testobject-1';
      const title2 = 'multi-select-toolbar-testobject-2';

      DocumentPage.CreateFullMcloudDocumentWithAPI(title, false);
      DocumentPage.CreateFullMcloudDocumentWithAPI(title2, false);

      Tree.openNode(['Neue Testdokumente']);
      Tree.multiSelectObject('mat-tree', [title, title2]);

      DocumentPage.checkOnlyActiveToolbarButtons(['Copy', 'Delete']);
    });

    it('should only select the expanded folder when it was selected', () => {
      const node = 'Testdokumente';

      Tree.openNode(['Testdokumente']);
      Tree.isSelectedNodeExpanded(node, true);

      Tree.activateMultiSelectMode();
      Tree.checkMultiSelectCheckboxIsVisible();
      Tree.checkboxSelected(node);

      Tree.checkNodeHasChildren(node);
      Tree.checkNextNodeIsAChildNode(node, 2);
      Tree.checkNodeIsNotSelected(node);
    });

    it('should only select the collapsed folder when it was selected', () => {
      const node = 'Testdokumente';

      Tree.activateMultiSelectMode();
      Tree.checkMultiSelectCheckboxIsVisible();

      Tree.clickOnNodeWithTitle(node);
      Tree.checkboxSelected(node);
      Tree.isSelectedNodeExpanded(node, false);

      Tree.checkNodeHasChildren(node);
      Tree.expandNode(node);
      Tree.checkNextNodeIsAChildNode(node, 2);
      Tree.checkNodeIsNotSelected(node);
    });

    it('should copy multiple selected nodes from different hierarchies into a folder', () => {
      const title = 'copy-multi-select-diff-hier-1';
      const title2 = 'copy-multi-select-diff-hier-2';
      const node = "Drag'n'Drop";

      // parent node is 'Neue Testdokumente'
      DocumentPage.CreateFullMcloudDocumentWithAPI(title, false);
      // parent node is 'Daten'
      DocumentPage.CreateFullMcloudDocumentWithAPI(title2, false, undefined);

      Tree.openNode(['Neue Testdokumente', title]);
      Tree.multiSelectObject('mat-tree', [title2]);
      CopyCutUtils.copyObject([node]);

      Tree.deactivateMultiSelectMode();
      Tree.checkMultiSelectCheckboxNotExist();

      Tree.isSelectedNodeExpanded(node, true);

      Tree.containsNodeWithObjectTitle(title, 2);
      Tree.containsNodeWithObjectTitle(title2, 2);
    });

    it('should move multiple selected nodes', () => {
      const title = 'multi-select-testobject-1';
      const title2 = 'multi-select-testobject-2';

      DocumentPage.CreateFullMcloudDocumentWithAPI(title, false);
      DocumentPage.CreateFullMcloudDocumentWithAPI(title2, false);

      Tree.openNode(['Neue Testdokumente']);
      Tree.multiSelectObject('mat-tree', [title, title2]);
    });

    it('should delete multiple selected nodes', () => {
      const title = 'multi-select-testobject-1-to-delete' + Utils.randomString();
      const title2 = 'multi-select-testobject-2-to-delete' + Utils.randomString();

      DocumentPage.CreateFullMcloudDocumentWithAPI(title, false);
      DocumentPage.CreateFullMcloudDocumentWithAPI(title2, false);

      Tree.openNode(['Neue Testdokumente', title]);
      Tree.multiSelectObject('mat-tree', [title2]);

      DocumentPage.deleteLoadedNode();
      // check if multiple selected Docs were deleted
      cy.get('mat-tree').contains(title).should('not.exist');
      cy.get('mat-tree').contains(title2).should('not.exist');
    });

    it('should not be able to move a tree into a node that is part of its own hierarchy', () => {
      const title = 'Ordner_Ebene_2A';
      const title2 = 'Ordner_Ebene_3A';

      Tree.openNode(['Neue Testdokumente', title]);
      CopyCutUtils.move(['Neue Testdokumente', title, title2]);
      // expect the error
      BasePage.checkErrorDialogMessage('Cannot copy');
    });
  });
});
