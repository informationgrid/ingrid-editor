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
    const query = exact ? new RegExp('^' + nodeTitle + '$') : nodeTitle;
    cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
    if (!isInsideDialog) cy.get(DocumentPage.title).should('have.text', nodeTitle);
  }

  static openNode(targetNodePath: string[]){
    targetNodePath.forEach(node => Tree.selectNodeWithTitle(node));
  }

  static deleteNode(deleteHoleNodePath: string[]){
    const reverseNodePath = deleteHoleNodePath.reverse();

    // deleteHoleNodePath.forEach(node =>  cy.get('#sidebar').findByText(node).click())
    reverseNodePath.forEach(node => {
      // cy.get('#sidebar').findByText(node).click({multiple: true, ctrlKey:true});

      cy.get('#sidebar').findByText(node).click();
      DocumentPage.deleteLoadedNode();
    })
    // DocumentPage.deleteLoadedNode();
  }

}
