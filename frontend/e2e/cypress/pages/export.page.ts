export class ExportPage {
  static visit() {
    cy.intercept('GET', 'api/tree/children').as('treeCallAddress');
    cy.visit('importExport/export');
    cy.wait('@treeCallAddress');
  }
}
