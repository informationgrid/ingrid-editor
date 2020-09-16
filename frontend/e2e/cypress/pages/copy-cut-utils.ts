import {SEPARATOR} from "./document.page";
import {Tree} from "./tree.partial";

enum CopyOption {
  COPY='[data-cy="copyMenu_COPY"]', COPY_WITH_TREE='[data-cy="copyMenu_COPYTREE"]', MOVE='[data-cy="copyMenu_CUT"]'
}


export class CopyCutUtils {
  static selectNodeWithChecks(nodeTitle: string, path: string[]){
    //Tree.selectNodeWithTitle(nodeTitle); <-- just work for level 0 nodes
    cy.get('#sidebar').contains(nodeTitle).click();
    cy.get('ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    cy.get('ige-header-title-row').contains(nodeTitle);
  }

  static copyObjectWithTree(targetNodePath?: string[]){

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
  }

  static dragdrop(dragnode: string, targetNodePath: string[], confirmChange: boolean){
    targetNodePath.forEach(node =>
      cy.get('#sidebar div:contains('+ dragnode +')').drag('#sidebar div:contains('+ node +')'));

    cy.then(() => cy.get('#sidebar').contains(targetNodePath[targetNodePath.length - 1]).trigger('drop'))

    if (confirmChange) {
      cy.get('[data-cy=confirm-dialog-confirm]').click();
    } else if (!confirmChange) {
      cy.get('[data-cy=confirm-dialog-cancel]').click();
    }
  }

  static dragdropWithoutAutoExpand (dragnode: string, targetNode: string, confirmChange: boolean){
    cy.get('#sidebar').contains(dragnode).trigger('dragstart', { dataTransfer: new DataTransfer });
    cy.get('#sidebar').findByText(targetNode).eq(0).trigger('drop');

    if (confirmChange) {
      cy.get('[data-cy=confirm-dialog-confirm]').click();
    } else if (!confirmChange) {
      cy.get('[data-cy=confirm-dialog-cancel]').click();
    }
  }
}
