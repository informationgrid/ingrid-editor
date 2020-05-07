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

  static selectNodeWithTitle(nodeTitle: string, isInsideDialog = false) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    cy.contains(`${parentContainer} mat-tree mat-tree-node .label`, nodeTitle).click();
  }
}
