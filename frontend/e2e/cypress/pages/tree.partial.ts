import { DocumentPage, SEPARATOR } from './document.page';
import Chainable = Cypress.Chainable;

export class Tree {
  static clickOnNodeWithTitle(nodeTitle: string, isInsideDialog = false, exact = true) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? new RegExp('^' + nodeTitle + '$') : nodeTitle;
    cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
  }

  static containsNodeWithFolderTitle(text: string, level?: number) {
    const exactText = new RegExp('^' + text + '$');
    const label = cy.contains('mat-tree mat-tree-node .label', exactText);

    if (level !== undefined) {
      return label.parent().parent().should('have.attr', 'aria-level', level.toString());
    } else {
      return label;
    }
  }

  static containsNodeWithObjectTitle(text: string, level?: number) {
    const label = cy.contains('mat-tree mat-tree-node .label', text);

    if (level !== undefined) {
      return label.parent().should('have.attr', 'aria-level', level.toString());
    } else {
      return label;
    }
  }

  static containsNotNodeWithTitle(text: string, level?: number) {
    const exactText = new RegExp('^' + text + '$');
    if (level) {
      cy.contains('mat-tree mat-tree-node .label span', exactText)
        .parent()
        .parent()
        .should('not.have.attr', 'aria-level', level.toString());
    } else {
      cy.contains('mat-tree mat-tree-node .label span', exactText).should('not.exist');
    }
  }

  static deleteNode(nodePath: string[]) {
    const reverseNodePath = nodePath.reverse();

    reverseNodePath.forEach(node => {
      cy.get('#sidebar').findByText(node).click();
      DocumentPage.deleteLoadedNode();
    });
  }

  static openNode(targetNodePath: string[], isInsideDialog = false, waitForShownInForm = true) {
    cy.log('Open node: ' + targetNodePath.join(' -> '));
    targetNodePath.forEach((node, index) => {
      Tree.selectNodeWithTitle(
        node,
        isInsideDialog,
        true,
        index + 1,
        index === targetNodePath.length - 1,
        waitForShownInForm
      );
    });
  }

  private static selectNodeWithTitle(
    nodeTitle: string,
    isInsideDialog = false,
    exact = true,
    hierarchyLevel?: number,
    forceClick?: boolean,
    waitForShownInForm: boolean = true
  ) {
    const parentContainer = isInsideDialog ? 'mat-dialog-container' : '';
    const query = exact ? this.getRegExp(nodeTitle) : nodeTitle;
    if (hierarchyLevel === undefined) {
      cy.contains(`${parentContainer} mat-tree mat-tree-node .label span`, query).click();
    } else {
      // only click on node if it isn't expanded
      cy.get(`${parentContainer} mat-tree mat-tree-node[aria-level="${hierarchyLevel}"]`, { timeout: 18000 })
        .should('contain.text', nodeTitle) // assert here to wait for tree to be updated in case node has been moved
        .contains('.label span', query)
        .then(node => {
          const treeNode = node.parents('mat-tree-node');
          const nodeIsSelected = treeNode.hasClass('active');
          const nodeIsExpanded = treeNode.hasClass('expanded');

          if (forceClick) {
            node.trigger('click');
            if (waitForShownInForm && !isInsideDialog && !nodeIsSelected) {
              // wait for document loaded, otherwise check might fail
              cy.contains(DocumentPage.title, nodeTitle, { timeout: 10000 }).should('be.visible');
              cy.get(DocumentPage.title).should('have.text', nodeTitle);
            }
          } else {
            if (!nodeIsExpanded) {
              node.trigger('click');
            } else {
              cy.log('Node already expanded (no click needed)');
            }
          }
        });
    }
  }

  static getNumberOfNodes(): Cypress.Chainable<number> {
    return cy.get('ige-sidebar mat-tree mat-tree-node').its('length');
  }

  // does not work with 0 children -> it doesn't tell you IF, but HOW MANY children there are
  static getNumberChildren(nodeName: string, stopper: number): Chainable<number> {
    return cy
      .contains('mat-tree-node', nodeName)
      .nextUntil('mat-tree-node[aria-level="' + stopper.toString() + '"]')
      .its('length');
  }

  static deleteChildren(nodeName: string, stopper: number): void {
    /* "stopper" is the stopping condition that defines to which node the set of children borders: this is where the
     * deleting is supposed to stop. It is necessary to be dynamic because the first non-child node (that should not be
     * deleted) can be of various aria-levels, depending on the structure of the tree */
    cy.contains('mat-tree-node', nodeName)
      .nextUntil('mat-tree-node[aria-level="' + stopper.toString() + '"]')
      .then($els => {
        // apply 'innerText' function to array of jquery elements
        Cypress._.map(Cypress.$.makeArray($els), 'innerText').forEach(element => {
          cy.contains('mat-tree-node', element).click();
          DocumentPage.deleteLoadedNode();
          cy.contains('mat-tree-node', nodeName).click();
        });
      });
  }

  static confirmCopy() {
    cy.intercept('POST', /\/copy/).as('copy');
    cy.get('[data-cy=create-applyLocation]').click();
    cy.wait('@copy');
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
    cy.contains('ige-header-title-row', nodeTitle, { timeout: 8000 });
  }

  static checkNodeHasChildren(nodeTitle: string) {
    const exactText = this.getRegExp(nodeTitle);
    cy.get('mat-tree-node').contains(exactText).parent().parent().find('button span mat-icon.expander').should('exist');
  }

  static activateMultiSelectMode() {
    cy.get('[data-cy=edit-button]').click();
  }

  static deactivateMultiSelectMode() {
    cy.get('[data-mat-icon-name=Entfernen]').click({ multiple: true });
  }

  static checkMultiSelectCheckboxIsVisible() {
    cy.get('mat-tree-node .mat-checkbox-layout').should('be.visible');
  }

  static checkMultiSelectCheckboxNotExist() {
    cy.get('mat-tree-node .mat-checkbox-layout').should('not.exist');
  }

  static expandNode(nodeTitle: string) {
    const exactText = this.getRegExp(nodeTitle);
    cy.get('mat-tree-node').contains(exactText).parent().parent().find('button span mat-icon.expander').click();
  }

  static checkNextNodeIsAChildNode(nodeTitle: string, level: number) {
    const exactText = this.getRegExp(nodeTitle);
    cy.get('mat-tree-node')
      .contains(exactText)
      .parent()
      .parent()
      .parent()
      .next()
      .should('have.attr', 'aria-level', level);
  }

  static checkNodeIsNotSelected(nodeTitle: string) {
    const exactText = this.getRegExp(nodeTitle);
    cy.get('mat-tree-node')
      .contains(exactText)
      .parent()
      .parent()
      .parent()
      .next()
      .should('not.have.class', 'mat-checkbox-checked');
  }

  static isSelectedNodeExpanded(nodeTitle: string, expanded: boolean) {
    const exactText = this.getRegExp(nodeTitle);
    if (expanded) {
      cy.get('mat-tree mat-tree-node').contains(exactText).parent().parent().parent().should('have.class', 'expanded');
    } else if (!expanded) {
      cy.get('mat-tree mat-tree-node')
        .contains(exactText)
        .parent()
        .parent()
        .parent()
        .should('not.have.class', 'expanded');
    }
  }
  static checkboxSelected(nodeTitle: string) {
    const exactText = this.getRegExp(nodeTitle);
    cy.get('mat-tree-node .mat-checkbox-checked').parent().contains(exactText);
  }

  static checkSelectedNodeHasNoChildren() {
    cy.get('mat-tree-node.active button.toggle .mat-icon.expander').should('not.exist');
  }

  private static getRegExp(nodeTitle: string): RegExp {
    return new RegExp('^' + nodeTitle + '$');
  }

  static goForward() {
    cy.get(DocumentPage.Toolbar.Next).click();
    cy.wait(100);
  }

  static goBack() {
    cy.get(DocumentPage.Toolbar.Previous).click();
    cy.wait(100);
  }

  static multiSelectObject(cssItem: string, nodelist: string[]) {
    cy.get('[data-cy=edit-button]').click();
    cy.get('mat-tree-node .mat-checkbox-layout').should('be.visible');

    nodelist.forEach(node => {
      cy.get(cssItem).contains(node).click();
      cy.get('mat-tree-node .mat-checkbox-checked').parent().contains(node);
    });
  }
}
