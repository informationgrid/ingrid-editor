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
    Recherche: 'ige-side-menu a:nth-child(4)',
    NutzerUndRechte: 'ige-side-menu a:nth-child(5)',
    ImportExport: 'ige-side-menu a:nth-child(6)',
    Katalogverwaltung: 'ige-side-menu a:nth-child(7)',
    Skalieren: 'ige-side-menu a:nth-child(9)'
  };
}

export enum CatalogsTabmenu {
  Codelisten = 1,
  Formulare,
  Katalogverhalten,
  Indizierung
}

export enum CodelistSubMenu {
  Bearbeiten = 1,
  Defaultwert,
  Loeschen
}

export enum UserAndRights {
  User = 1,
  Group
}

export enum UserRoles {
  KatalogAdmin = 1,
  MetadatenAdmin,
  Autor
}
