export type Page = 'DASHBOARD' | 'DOCUMENTS' | 'ADDRESSES' | 'RESEARCH' | 'REPORTS' | 'USERS' | 'IMPORT' | 'CATALOG';

export class Menu {
  static switchTo(page: Page) {
    const routerLink = Menu.mapPageToRouterLink(page);
    cy.get(`[href="${routerLink}"]`).click();
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
}
