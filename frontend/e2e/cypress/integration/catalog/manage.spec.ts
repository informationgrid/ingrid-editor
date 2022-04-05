import { DocumentPage } from '../../pages/document.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { AdminUserPage, UserFormData } from '../../pages/administration-user.page';
import { Utils } from '../../pages/utils';
import { Menu } from '../../pages/menu';
import { ManageCatalogPage } from '../../pages/manage-catalog.page';
import { ResearchPage } from '../../pages/research.page';
import { AddressPage } from '../../pages/address.page';

describe('Catalog management', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    ManageCatalogPage.visit();
  });

  it('should create a new catalog', () => {
    const catalogTitle = 'ng-universe_cat';

    ManageCatalogPage.addCatalog(catalogTitle);
    cy.get('ige-catalog-management mat-card').should('contain', catalogTitle);
  });

  it('should not be able to create a new catalogue with an existing name (#3463)', () => {
    const catalogTitle = 'no_duplicates';
    // create catalogue
    ManageCatalogPage.addCatalog(catalogTitle);

    // try to create new catalogue with existing name
    cy.get('.main-header button').contains('Hinzufügen').click();
    cy.get('mat-dialog-container input').type(catalogTitle);
    cy.intercept('/api/info/setCatalogAdmin').as('setNewCatalogue');
    cy.get('mat-dialog-actions button').contains('Anlegen').click();

    // except failing server communication
    cy.wait('@setNewCatalogue').its('response.statusCode').should('not.eq', 200);
  });

  it('should modify an existing catalog', () => {
    const catalogTitle = 'ng-universe_cat';
    const catalogTitleModified = '-Modified';

    ManageCatalogPage.openCatalogCardMenu(catalogTitle);

    cy.get('button').contains('Bearbeiten').click();
    cy.get('mat-menu-panel').should('not.exist');
    cy.get('mat-form-field:nth-child(1)').type(catalogTitleModified);
    cy.get('button').contains('Aktualisieren').click();

    cy.get('[data-cy="' + catalogTitle + catalogTitleModified + '"]').should('contain', catalogTitle);
  });

  it('should change display of information after modifying catalog', () => {
    const docName = 'someNewDataset' + Utils.randomString();
    ManageCatalogPage.getNumberOfDatasetsInCatalog('Test').then(oldNumberOfDocs => {
      // add document
      DocumentPage.CreateFullMcloudDocumentWithAPI(docName);
      // refresh page
      ManageCatalogPage.visit();
      // compare values
      ManageCatalogPage.getNumberOfDatasetsInCatalog('Test').should('be.greaterThan', oldNumberOfDocs);
      ManageCatalogPage.getDateOfChangesInCatalog('Test').should('equal', Utils.getFormattedDateTime(new Date()));
    });
  });

  it('should delete an existing catalog', () => {
    const catalogTitle = 'ng-universe_cat-Modified';

    ManageCatalogPage.openCatalogCardMenu(catalogTitle);
    cy.get('button').contains('Bearbeiten').click();
    cy.get('mat-menu-panel').should('not.exist');
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
    Menu.switchTo('USERS');
    cy.contains('button', 'Hinzufügen').click();

    let catalogFirstname = 'catalog' + Utils.randomString();
    let user: UserFormData = {
      firstName: catalogFirstname,
      lastName: 'temp' + Utils.randomString(),
      email: 'testcatalog' + Utils.randomDoubleDigitString() + '@thisauthor.com',
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

    ManageCatalogPage.switchToCatalog(catalogTitle);

    // check if new created catalog is active
    cy.get('.catalog-title').contains(catalogTitle);

    // check dataset are different
    // check if search only gets documents from the correct catalog
    Menu.switchTo('RESEARCH');
    ResearchPage.search('a');
    ResearchPage.checkNoSearchResults();

    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();

    ManageCatalogPage.switchToCatalog('Test');

    // check if 'Test' catalog is active
    cy.get('.catalog-title').contains('Test');

    Menu.switchTo('RESEARCH');
    ResearchPage.search('a');
    ResearchPage.getSearchResultCount().should('be.greaterThan', 0);
  });

  // make sure we use the correct catalog for the other tests
  // send an API call to set current catalog to 'test'
  after(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/user/catalog/test`,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  });
});
