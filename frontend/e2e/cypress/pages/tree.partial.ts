import { DocumentPage, SEPARATOR } from './document.page';

export class Tree {
  static clickOnNodeWithTitle(nodeTitle: string, isInsideDialog = false, exact = true) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? new RegExp('^' + nodeTitle + '$') : nodeTitle;
    cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
  }

  static containsNodeWithTitle(text: string, level?: number) {
    return this.checkNodeWithTitle(text, level);
  }

  static containsNotNodeWithTitle(text: string, level?: number) {
    return this.checkNodeWithTitle(text, level, true);
  }

  private static checkNodeWithTitle(text: string, level?: number, invert?: boolean) {
    const exactText = new RegExp('^' + text + '$');
    if (invert) {
      if (level) {
        cy.contains('mat-tree mat-tree-node .label span', exactText)
          .parent()
          .parent()
          .should('not.have.attr', 'aria-level', level.toString());
      } else {
        cy.contains('mat-tree mat-tree-node .label span', exactText).should('not.exist');
      }
      return true;
    }

    const label = cy.contains('mat-tree mat-tree-node .label', exactText);

    if (level !== undefined) {
      return label.parent().parent().should('have.attr', 'aria-level', level.toString());
    } else {
      return label;
    }
  }

  static deleteNode(nodePath: string[]) {
    const reverseNodePath = nodePath.reverse();

    reverseNodePath.forEach(node => {
      cy.get('#sidebar').findByText(node).click();
      DocumentPage.deleteLoadedNode();
    });
  }

  static openNode(targetNodePath: string[], isInsideDialog: boolean = false) {
    cy.log('Open node: ' + targetNodePath.join(' -> '));
    targetNodePath.forEach((node, index) => {
      Tree.selectNodeWithTitle(node, isInsideDialog, true, index + 1, index === targetNodePath.length - 1);
    });
    if (!isInsideDialog) {
      this.determineRootAndCheckPath(targetNodePath);
    }
  }

  // check if opened node has correct breadcrumb so we loaded correct document
  private static determineRootAndCheckPath(nodePath: string[]) {
    cy.url().then(url => {
      const docRoot = url.indexOf('/form') !== -1 ? 'Daten' : 'Adressen';
      this.checkPath([docRoot, ...nodePath.filter((item, index) => index !== nodePath.length - 1)]);
    });
  }

  private static selectNodeWithTitle(
    nodeTitle: string,
    isInsideDialog = false,
    exact = true,
    hierarchyLevel?: number,
    forceClick?: boolean
  ) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? this.getRegExp(nodeTitle) : nodeTitle;
    if (hierarchyLevel === undefined) {
      cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
    } else {
      // only click on node if it isn't expanded
      cy.get(`${parentContainer} mat-tree mat-tree-node[aria-level="${hierarchyLevel}"]`)
        .should('contain.text', nodeTitle) // assert here to wait for tree to be updated in case node has been moved
        .contains('.label span', query)
        .then(node => {
          const treeNodeParent = node.parent().parent().parent();
          if (forceClick || !treeNodeParent.hasClass('expanded')) {
            node.trigger('click');
            // give some time to add open state. Parent might be selected otherwise again instead of child
            // with the assertion that a node should contain a title, we don't need a wait anymore
            // cy.wait(200);
          }
        });
    }
    if (!isInsideDialog) {
      // cy.get(DocumentPage.title).should('have.text', nodeTitle);
    }
  }

  static getNumberOfNodes(): Cypress.Chainable<number> {
    return cy.get('mat-tree mat-tree-node').its('length');
  }

  static selectNodeAndCheckPath(nodeTitle: string, path: string[]) {
    this.clickOnNodeWithTitle(nodeTitle);
    this.checkPath(path);
    cy.get('ige-header-title-row').contains(nodeTitle);
  }

  static checkPath(path: string[], isInsideDialog = false) {
    cy.log('Check breadcrumb for correct path');
    if (isInsideDialog) {
      cy.get('.mat-dialog-container ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    } else {
      cy.get('ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    }
  }

  static checkTitleOfSelectedNode(nodeTitle: string) {
    cy.get('ige-header-title-row').contains(nodeTitle);
  }

  static checkSelectedNodeHasChildren() {
    cy.get('mat-tree-node.active button.toggle').should('exist');
  }

  static checkSelectedNodeHasNoChildren() {
    cy.get('mat-tree-node.active button.toggle .mat-icon.expander').should('not.exist');
  }

  private static getRegExp(nodeTitle: string): RegExp {
    return new RegExp('^' + nodeTitle + '$');
  }
}
