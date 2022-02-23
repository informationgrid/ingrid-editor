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
    // wait a bit longer since page will be reloaded
    cy.wait(4000);
  }

  static getNumberOfDatasetsInCatalog(catalogTitle: string) {
    return cy
      .get('.mat-card')
      .contains('.mat-card-title', new RegExp('^' + catalogTitle + '$'))
      .parent()
      .find('.content')
      .then($node => {
        // extract number from string like '12 Datensätze'
        return parseInt($node.text().trim().split(' ')[0]);
      });
  }

  static getDateOfChangesInCatalog(catalogTitle: string) {
    return cy
      .get('.mat-card')
      .contains('.mat-card-title', new RegExp('^' + catalogTitle + '$'))
      .parent()
      .find('.mat-card-subtitle')
      .then($node => {
        // extract part of the string that follows "Letzte Änderung am"
        return /(?<=am\s).*$/.exec($node.text())[0].trim();
      });
  }

  static addCatalog(catalogTitle: string) {
    cy.get('.main-header button').contains('Hinzufügen').click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.intercept('POST', '/api/catalogs').as('setNewCatalogue');
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    cy.wait('@setNewCatalogue');
  }
}
