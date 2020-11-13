import {DocumentPage, SEPARATOR} from "./document.page";

export class Tree {

  static clickOnNodeWithTitle(nodeTitle: string, isInsideDialog = false, exact = true){
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? new RegExp('^' + nodeTitle + '$') : nodeTitle;
    cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
  }

  static containsNodeWithTitle(text: string, level?: number) {

    const label = cy.contains('mat-tree mat-tree-node .label', text);

    if (level !== undefined) {
      return label
        .parent().parent()
        .should('have.attr', 'aria-level', level.toString());
    } else {
      return label;
    }

  }

  /**
   * This function is not working correctly
   * @param nodePath
   * @deprecated
   */
  static deleteNode(nodePath: string[]) {
    const reverseNodePath = nodePath.reverse();

    reverseNodePath.forEach(node => {
      cy.get('#sidebar').findByText(node).click();
      DocumentPage.deleteLoadedNode();
    });
  }

  static openNode(targetNodePath: string[], isInsideDialog: boolean = false){
    targetNodePath.forEach((node, index) => Tree.selectNodeWithTitle(node, isInsideDialog, true, index + 1));
  }

  static selectNodeWithTitle(nodeTitle: string, isInsideDialog = false, exact = true, hierarchyLevel?: number) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? new RegExp('^' + nodeTitle + '$') : nodeTitle;
    if (hierarchyLevel === undefined) {
      cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
    } else {
      cy.contains(`${parentContainer} mat-tree mat-tree-node[aria-level="${hierarchyLevel}"] .label span`, query).click();
    }
    if (!isInsideDialog) {
      cy.get(DocumentPage.title).should('have.text', nodeTitle);
    }
  }

  static selectNodeAndCheckPath(nodeTitle: string, path: string[]){
    cy.get('#sidebar').contains(nodeTitle).click();
    this.checkPath(path);
    cy.get('ige-header-title-row').contains(nodeTitle);
  }

  static checkPath(path: string[], isInsideDialog = false){
    if (isInsideDialog){
      cy.get('.mat-dialog-container ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    } else {
      cy.get('ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    }
  }

  static checkTitleOfSelectedNode(nodeTitle: string){
    cy.get('ige-header-title-row').contains(nodeTitle);
  }

}
