import { DocumentPage } from '../../pages/document.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { AdminUserPage, UserFormData } from '../../pages/administration-user.page';
import { Utils } from '../../pages/utils';

describe('Catalog management', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
    cy.visit('');
  });

  it('should create a new catalog', () => {
    const catalogTitle = 'ng-universe_cat';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    cy.get('.main-header button').contains('Hinzufügen').wait(100).click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.intercept('/api/info/setCatalogAdmin').as('setNewCatalogue');
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    cy.wait('@setNewCatalogue');
    cy.contains('ige-catalog-management mat-card', catalogTitle);
  });

  it('should not be able to create a new catalogue with an existing name (#3463)', () => {
    const catalogTitle = 'no_duplicates';
    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();
    // create catalogue
    cy.get('.main-header button').contains('Hinzufügen').wait(100).click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.intercept('POST', '/api/catalogs').as('setNewCatalogue');
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    cy.wait('@setNewCatalogue');
    cy.contains('ige-catalog-management mat-card', catalogTitle);

    // try to create new catalogue with existing name
    cy.get('.main-header button').contains('Hinzufügen').wait(100).click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.intercept('/api/info/setCatalogAdmin').as('setNewCatalogue');
    cy.get('mat-dialog-actions button').contains('Anlegen').click();
    // except failing server communication
    cy.wait('@setNewCatalogue').its('response.statusCode').should('not.eq', 200);
  });

  it('should modify an existing catalog', () => {
    const catalogTitle = 'ng-universe_cat';
    const catalogTitleModified = '-Modified';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    ManageSpec.openCatalogCardMenu(catalogTitle);

    cy.get('button').contains('Bearbeiten').click();
    cy.get('mat-form-field:nth-child(1)').type(catalogTitleModified);
    cy.get('button').contains('Aktualisieren').click();
    cy.wait(300);

    cy.get('[data-cy="' + catalogTitle + catalogTitleModified + '"]').contains(catalogTitle);
  });

  it('should delete an existing catalog', () => {
    const catalogTitle = 'ng-universe_cat-Modified';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

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

  it('should add a catalog administrator', () => {
    AdminUserPage.visit();
    cy.contains('button', 'Hinzufügen').click();

    let catalogFirstname = 'catalog' + Utils.randomString();
    let user: UserFormData = {
      firstName: catalogFirstname,
      lastName: 'temp' + Utils.randomString(),
      email: 'testcatalog' + Utils.randomdoubleDigitString() + '@thisauthor.com',
      login: 'some_random_catalohlogin' + Utils.randomString(),
      role: 'Katalog-Administrator',
      groups: [],
      organisation: ''
    };
    AdminUserPage.addNewUser(user, true);

    AdminUserPage.selectUser(catalogFirstname);
  });

  it('should switch between two catalogs', () => {
    const catalogTitle = 'new Catalog';

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    ManageSpec.openCatalogCardMenu(catalogTitle);
    // use "Verwenden" button on catalog to switch to new catalog
    cy.get('button').contains('Verwenden').click();
    cy.wait(100);

    // check if new created catalog is active
    cy.get('.catalog-title').contains(catalogTitle);

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
    cy.wait(100);

    // check if 'Test' catalog is active
    cy.get('.catalog-title').contains('Test');

    cy.get(DocumentPage.Sidemenu.Uebersicht).click();
    DashboardPage.search('a');
    cy.get('button').contains('Suchen').click();
    cy.get('div.result').should('not.have.text', '0 Ergebnisse gefunden');
  });

  it('test the right catalog is selected, switch if necessary', () => {
    // when we use the wrong catalog, it could happen that some tests fail, because pre-created objects are missing
    cy.get('.catalog-title').then($info => {
      const headerInfo = $info.text();

      if (headerInfo === 'Test') {
        cy.get('.catalog-title').contains('Test');
      } else {
        cy.get('[data-cy=header-info-button]').click();
        cy.get('button').contains('Katalogverwaltung').click();
        cy.wait(300);

        ManageSpec.openCatalogCardMenu('Test');
        // use "Verwenden" button on catalog to switch to new catalog
        cy.get('button').contains('Verwenden').click();
        cy.wait(100);

        cy.get('.catalog-title').contains('Test');
      }
    });
  });
});

class ManageSpec {
  static openCatalogCardMenu(title: string) {
    cy.get(`[data-cy="${title}"]`).trigger('mouseover').parent().find('button.mat-menu-trigger').click({ force: true });
  }
}
