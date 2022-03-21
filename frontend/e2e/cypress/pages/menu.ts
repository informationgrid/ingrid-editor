import { ResearchPage } from './research.page';

export type Page = 'DASHBOARD' | 'DOCUMENTS' | 'ADDRESSES' | 'RESEARCH' | 'REPORTS' | 'USERS' | 'IMPORT' | 'CATALOG';

export class Menu {
  static switchTo(page: Page) {
    const routerLink = Menu.mapPageToRouterLink(page);
    cy.get(`[href="${routerLink}"]`).click();
    Menu.waitForPage(page);
  }

  private static mapPageToRouterLink(page: Page) {
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
        cy.get('.main-page-title').should('contain', 'Adressen', { timeout: 6000 });
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
