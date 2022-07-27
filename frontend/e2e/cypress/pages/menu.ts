export type Page = 'DASHBOARD' | 'DOCUMENTS' | 'ADDRESSES' | 'RESEARCH' | 'REPORTS' | 'USERS' | 'IMPORT' | 'CATALOG';
export type GeneralPage = 'GENERAL' | 'CODELIST_REPOSITORY' | 'CATALOG_MANAGEMENT';

export class Menu {
  static switchTo(page: Page, waitForPage = true) {
    const menuId = Menu.mapPageToMenuId(page);
    cy.wait(500);
    cy.get(`[data-cy="${menuId}"]`).click();
    if (waitForPage) Menu.waitForPage(page);
  }

  static switchToGeneral(page: GeneralPage) {
    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();
  }

  private static mapPageToMenuId(page: Page | GeneralPage) {
    switch (page) {
      case 'DASHBOARD':
        return 'dashboard';
      case 'DOCUMENTS':
        return 'form';
      case 'ADDRESSES':
        return 'address';
      case 'RESEARCH':
        return 'research';
      case 'REPORTS':
        return 'reports';
      case 'USERS':
        return 'manage';
      case 'IMPORT':
        return 'importExport';
      case 'CATALOG':
        return 'catalogs';
      case 'GENERAL':
        return 'Allgemein';
      case 'CODELIST_REPOSITORY':
        return 'Codelist Repository';
      case 'CATALOG_MANAGEMENT':
        return 'Katalogverwaltung';
    }
  }

  private static waitForPage(page: Page) {
    switch (page) {
      case 'DASHBOARD':
        cy.get('.welcome').should('contain', 'Willkommen');
        return;
      case 'DOCUMENTS':
        cy.get('.main-page-title').should('contain', 'Daten');
        return;
      case 'ADDRESSES':
        cy.contains('.main-page-title', 'Adressen', { timeout: 10000 });
        return;
      case 'RESEARCH':
        cy.url().should('contain', '/research/');
        return;
      case 'REPORTS':
        return;
      case 'USERS':
        cy.get('.page-title').should('contain', 'Benutzer');
        cy.get('#sidebarUser .mat-spinner').should('not.exist');
        return;
      case 'IMPORT':
        return;
      case 'CATALOG':
        return;
    }
  }
}
