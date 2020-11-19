export class BasePage {
  static type(dataId: string, text?: string) {
    if (text === undefined) {
      return;
    } else if (text === '') {
      cy.get(`[data-cy=${dataId}]`).clear();
    } else {
      cy.get(`[data-cy=${dataId}]`).type(text);
    }
  }

  static Sidemenu: Record<string, string> = {
    Uebersicht: 'ige-side-menu a:nth-child(1)',
    Daten: 'ige-side-menu a:nth-child(2)',
    Adressen: 'ige-side-menu a:nth-child(3)',
    ImportExport: 'ige-side-menu a:nth-child(4)',
    Katalogverwaltung: 'ige-side-menu a:nth-child(5)'
  };
}
