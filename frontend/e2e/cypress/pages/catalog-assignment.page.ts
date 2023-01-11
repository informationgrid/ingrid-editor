export class CatalogAssignmentPage {
  static visit() {
    cy.visit('settings/catalogAssignment');
    cy.get('ige-catalog-assignment', { timeout: 9000 });
  }

  static chooseUser(item: string, itemType: 'user' | 'catalog') {
    this.getOption(item, itemType);
  }

  static chooseCatalog(item: string, itemType: 'user' | 'catalog') {
    this.getOption(item, itemType);
  }

  static getOption(item: string, itemType: string) {
    const placeholder = itemType === 'catalog' ? 'Katalog auswählen...' : 'Nutzer auswählen...';

    cy.get(`.content input[placeholder="${placeholder}"]`).clear().type(item);
    cy.contains('.mat-autocomplete-panel mat-option', item).click();
    cy.get(`.content input[placeholder="${placeholder}"]`).should('have.value', item);
  }

  static assign() {
    cy.intercept('POST', /assignCatalog/).as('assignCatalog');
    cy.contains('button', 'Katalog zuweisen').click();
    cy.wait('@assignCatalog').its('response.statusCode').should('eq', 200);
  }
}
