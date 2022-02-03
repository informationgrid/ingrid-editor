export class ManageCatalogPage {
  static visit() {
    cy.intercept({ method: 'GET', url: '/api/catalogs', times: 1 }).as('catalogs');
    cy.visit('settings/catalog');
    cy.wait('@catalogs');
  }

  static openCatalogCardMenu(title: string) {
    cy.get(`[data-cy="${title}"]`).trigger('mouseover').parent().find('button.mat-menu-trigger').click({ force: true });
  }

  static switchToCatalog(title: string) {
    ManageCatalogPage.openCatalogCardMenu(title);
    // use "Verwenden" button on catalog to switch to new catalog
    cy.get('button').contains('Verwenden').click();
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
