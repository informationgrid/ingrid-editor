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
    Uebersicht: '[href="/dashboard"]',
    Daten: '[href="/form"]',
    Adressen: '[href="/address"]',
    Recherche: '[href="/research"]',
    NutzerUndRechte: '[href="/user"]',
    ImportExport: '[href="/importExport"]',
    Katalogverwaltung: '[href="/catalogs"]',
    Skalieren: '.mat-list-item[mattooltip="Vergrößern"]'
  };

  // TODO: use this function for all select inputs
  static selectOptionAsync(selectDataCyName: string, label: string, placeholder = 'Bitte wählen ...') {
    cy.get(`[data-cy="${selectDataCyName}"]`)
      .contains(placeholder) // placeholder should appear after data has been fetched for select
      .wait(500) // wait for field to be populated
      .click()
      .get('[role="listbox"] mat-option')
      .contains(label)
      .click();
  }
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
  User = '/manage/user',
  Group = '/manage/group'
}
