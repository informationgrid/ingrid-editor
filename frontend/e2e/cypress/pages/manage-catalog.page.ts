export class ManageCatalogPage {
  static visit() {
    cy.visit('settings/catalog');
    cy.get('ige-catalog-management .page-title').should('contain.text', 'Katalogverwaltung');
  }

  static openCatalogCardMenu(title: string) {
    cy.get(`[data-cy="${title}"]`, { timeout: 10000 })
      .should('exist')
      .scrollIntoView()
      .trigger('mouseover')
      .find('button.mat-menu-trigger')
      .click({ force: true });
  }

  static switchToCatalog(title: string) {
    ManageCatalogPage.openCatalogCardMenu(title);
    // use "Verwenden" button on catalog to switch to new catalog
    cy.get('button.mat-menu-item').contains('Verwenden').click();
    cy.wait(1000);
  }

  static addCatalog(catalogTitle: string) {
    cy.get('.main-header button').contains('Hinzufügen').click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.intercept('POST', '/api/catalogs').as('setNewCatalogue');
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    cy.wait('@setNewCatalogue');
  }
}
