import { DocumentPage } from '../../pages/document.page';
import { DashboardPage } from '../../pages/dashboard.page';

describe('Catalog management', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should create a new catalog', () => {
    const catalogTitle = 'ng-universe';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    cy.get('.main-header button').contains('Hinzufügen').wait(100).click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    cy.wait(300);

    cy.get('ige-catalog-management mat-card').contains(catalogTitle);
  });

  it('should modify an existing dialog', () => {
    const catalogTitle = '_modified_title';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    ManageSpec.openCatalogCardMenu('Test');

    cy.get('button').contains('Bearbeiten').click();
    cy.get('mat-form-field:nth-child(1)').type(catalogTitle);
    cy.get('button').contains('Aktualisieren').click();
    cy.wait(300);

    cy.get('ige-catalog-management mat-card').contains(catalogTitle);
  });

  it('should delete an existing dialog', () => {
    const catalogTitle = 'ng-universe';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();
    cy.wait(300);

    ManageSpec.openCatalogCardMenu(catalogTitle);
    cy.get('button').contains('Bearbeiten').click();
    cy.get('button').contains('Löschen').click();

    // deletion should only work by typing word "Löschen" -- test with wrong word
    cy.get('[data-cy=confirm-dialog-confirm]').should('be.disabled');
    cy.get('mat-form-field:last-child').type('Eintrag_löschen');
    cy.get('[data-cy=confirm-dialog-confirm]').should('be.disabled');
    cy.get('[data-cy=confirm-dialog-cancel]').click();

    // test with correct word -> real delete
    cy.get('button').contains('Löschen').click();
    cy.get('mat-form-field:last-child').type('Löschen');
    cy.get('[data-cy=confirm-dialog-confirm]').should('be.enabled');
    cy.get('[data-cy=confirm-dialog-confirm]').click();

    cy.get('ige-catalog-management mat-card').contains(catalogTitle).should('not.exist');
  });

  xit('should add a catalog administrator', () => {});

  it('should switch between two catalogs', () => {
    const catalogTitle = 'ng-universe 2.0';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    // create new catalog to switch to it
    cy.get('.main-header button').contains('Hinzufügen').wait(100).click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    cy.wait(300);

    ManageSpec.openCatalogCardMenu(catalogTitle);
    // use "Verwenden" button on catalog to switch to new catalog
    cy.get('button').contains('Verwenden').click();

    // check if new created catalog is active
    cy.get('.section-title').contains('Aktiver Katalog').next().should('contain', catalogTitle);

    // check dataset are different
    // check if search only gets documents from the correct catalog
    cy.get(DocumentPage.Sidemenu.Uebersicht).click();
    DashboardPage.search('a');
    cy.get('button').contains('Suchen').click();
    cy.get('div.result').contains('0 Ergebnisse gefunden');

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();
    cy.wait(300);

    ManageSpec.openCatalogCardMenu('Test');
    // use "Verwenden" button on catalog to switch to new catalog
    cy.get('button').contains('Verwenden').click();

    cy.get(DocumentPage.Sidemenu.Uebersicht).click();
    DashboardPage.search('a');
    cy.get('button').contains('Suchen').click();
    cy.get('div.result').should('not.have.text', '0 Ergebnisse gefunden');
  });
});

class ManageSpec {
  static openCatalogCardMenu(title: string) {
    cy.get(`[data-cy="${title}"]`).trigger('mouseover').parent().find('button.mat-menu-trigger').click({ force: true });
  }
}
