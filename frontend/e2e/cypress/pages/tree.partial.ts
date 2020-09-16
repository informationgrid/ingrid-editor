import {DocumentPage} from "./document.page";

export class Tree {

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

  static selectNodeWithTitle(nodeTitle: string, isInsideDialog = false, exact = true) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? new RegExp('^ ' + nodeTitle + ' $', 'g') : nodeTitle;
    cy.contains(`${parentContainer} mat-tree mat-tree-node .label`, query).click();
    if (!isInsideDialog) cy.get(DocumentPage.title).should('have.text', nodeTitle);
  }

  /**
   * true -> exact same, false -> nearly same/similar
   * default is false
   * @param exact
   */
  static openNode(targetNodePath: string[], exact= false){
    targetNodePath.forEach(node => Tree.selectNodeWithTitle(node, false, exact));
  }

  static deleteNode(deleteHoleNodePath: string[]){
    const reverseNodePath = deleteHoleNodePath.reverse();

    deleteHoleNodePath.forEach(node => Tree.selectNodeWithTitle(node, false, true))
    reverseNodePath.forEach(node => {
      cy.contains(node).click({ctrlKey:true});
    })
    cy.get(DocumentPage.Toolbar.Delete).click();
    cy.get('[data-cy=confirm-dialog-confirm]').click();
  }

}
