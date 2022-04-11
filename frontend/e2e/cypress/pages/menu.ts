import { ResearchPage } from './research.page';

export type Page = 'DASHBOARD' | 'DOCUMENTS' | 'ADDRESSES' | 'RESEARCH' | 'REPORTS' | 'USERS' | 'IMPORT' | 'CATALOG';
export type GeneralPage = 'GENERAL' | 'CODELIST_REPOSITORY' | 'CATALOG_MANAGEMENT';

export class Menu {
  static switchTo(page: Page) {
    const routerLink = Menu.mapPageToRouterLink(page);
    cy.get(`[href="${routerLink}"]`).click();
    Menu.waitForPage(page);
  }

  static switchToGeneral(page: GeneralPage) {
    cy.get('[data-cy=header-info-button]').click();
    cy.get('button').contains('Katalogverwaltung').click();
  }

  private static mapPageToRouterLink(page: Page | GeneralPage) {
    switch (page) {
      case 'DASHBOARD':
        return '/dashboard';
      case 'DOCUMENTS':
        return '/form';
      case 'ADDRESSES':
        return '/address';
      case 'RESEARCH':
        return '/research';
      case 'REPORTS':
        return '/reports';
      case 'USERS':
        return '/manage';
      case 'IMPORT':
        return '/importExport';
      case 'CATALOG':
        return '/catalogs';
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
        cy.get('.main-page-title', { timeout: 10000 }).should('contain', 'Adressen');
        return;
      case 'RESEARCH':
        cy.url().should('contain', '/research/');
        return;
      case 'REPORTS':
        return;
      case 'USERS':
        cy.get('.page-title').should('contain', 'Nutzer');
        cy.get('#sidebarUser .mat-spinner').should('not.exist');
        return;
      case 'IMPORT':
        return;
      case 'CATALOG':
        return;
    }
  }
}
