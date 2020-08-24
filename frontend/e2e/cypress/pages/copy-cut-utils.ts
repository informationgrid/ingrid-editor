import {SEPARATOR} from "./document.page";

export class copyCutUtils {
  static selectNodeWithChecks(nodeTitle: string, path: string[]){
    //Tree.selectNodeWithTitle(nodeTitle); <-- just work for level 0 nodes
    cy.get('#sidebar').contains(nodeTitle).click();
    cy.get('ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    cy.get('ige-header-title-row').contains(nodeTitle);
  }
  static copyObjectWithTree(rootNode: string, secondNode: string){
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[aria-disabled=false]').contains('Kopieren mit Teilbaum').click();
    cy.get('#mat-dialog-2').findByText(rootNode).click();
    cy.wait(500) //TODO delete when better selector is found
    cy.get('ige-tree mat-tree mat-tree-node div').contains(secondNode).click();
    cy.get('[data-cy=create-applyLocation]').click();
  }

  static copyObject(rootNode: string, secondNode: string) {
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[aria-disabled=false]').contains('Kopieren').click();
    cy.get('#mat-dialog-1').findByText(rootNode).click();
    cy.wait(500) //TODO delete when better selector is found
    cy.get('ige-tree mat-tree mat-tree-node div').contains(secondNode).click();
    cy.get('[data-cy=create-applyLocation]').click();
  }

  static moveObject(rootNode: string, secondNode: string) {
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[aria-disabled=false]').contains('Verschieben (inkl. Teilbaum)').click();
    cy.get('#mat-dialog-2').findByText(rootNode).click();
    cy.wait(500) //TODO delete when better selector is found
    cy.get('ige-tree mat-tree mat-tree-node div').contains(secondNode).click();
    cy.get('[data-cy=create-applyLocation]').click();
  }
}
