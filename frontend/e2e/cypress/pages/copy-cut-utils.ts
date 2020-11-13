import {Tree} from './tree.partial';

enum CopyOption {
  COPY = '[data-cy="copyMenu_COPY"]', COPY_WITH_TREE = '[data-cy="copyMenu_COPYTREE"]', MOVE = '[data-cy="copyMenu_CUT"]'
}


export class CopyCutUtils {


  static copyObjectWithTree(targetNodePath?: string[]) {

    this.handleCopyMove(CopyOption.COPY_WITH_TREE, targetNodePath);

  }

  static copyObject(targetNodePath?: string[]) {

    this.handleCopyMove(CopyOption.COPY, targetNodePath);

  }

  /**
   * Moves selected nodes to targetNode. If targetNode not defined then selected nodes are
   * moved to the root node.
   * @param targetNodePath
   */
  static move(targetNodePath?: string[]) {

    this.handleCopyMove(CopyOption.MOVE, targetNodePath);

  }

  private static handleCopyMove(option: CopyOption, targetNodePath?: string[]) {
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get(option).click();
    if (targetNodePath) {
      targetNodePath.forEach(node => Tree.selectNodeWithTitle(node, true));
    } else {
      cy.get(`.mat-dialog-content .mat-selection-list > :first-child`).click();
    }
    cy.get('[data-cy=create-applyLocation]').click();

    // wait for tree being refreshed with new node information
    // otherwise we might get an "detached from the DOM"-error
    cy.wait(500);
  }

  static dragdrop(dragnode: string, targetNodePath: string[], confirmChange: boolean) {
    targetNodePath.forEach((node, i) => {
      // with option force: true we will not do any checks and no scrolling is performed, which is important
      // for drag'n'drop tests
      cy.get('#sidebar div:contains(' + dragnode + ')')
        .click({force: true})
        .drag('#sidebar div:contains(' + node + ')', {force: true});

      if (i < targetNodePath.length - 1) {
        // check next item is expanded
        cy.get('#sidebar div:contains(' + targetNodePath[i + 1] + ')');
      }
    });

    cy.then(() => cy.get('#sidebar')
      .contains(targetNodePath[targetNodePath.length - 1])
      .trigger('drop'));

    if (confirmChange) {
      cy.get('[data-cy=confirm-dialog-confirm]').click();
    } else if (!confirmChange) {
      cy.get('[data-cy=confirm-dialog-cancel]').click();
    }
  }

  static dragdropWithoutAutoExpand(dragnode: string, targetNode: string, confirmChange: boolean) {
    cy.get('#sidebar').contains(dragnode).trigger('dragstart', {dataTransfer: new DataTransfer});
    cy.get('#sidebar').findByText(targetNode).eq(0).trigger('drop');

    if (confirmChange) {
      cy.get('[data-cy=confirm-dialog-confirm]').click();
    } else if (!confirmChange) {
      cy.get('[data-cy=confirm-dialog-cancel]').click();
    }
  }
}
