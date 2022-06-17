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
    Skalieren: '.mat-list-item[mattooltip="Vergrößern"]'
  };

  // TODO: use this function for all select inputs
  static selectOptionAsync(selectDataCyName: string, label: string, placeholder = 'Bitte wählen ...') {
    cy.contains(`[data-cy="${selectDataCyName}"] div`, label, { timeout: 8000 }).click();
  }

  static selectOption(selectDataCyName: string, label: string) {
    cy.get(`[data-cy=${selectDataCyName}]`).click();
    // wait for animation
    cy.wait(300);
    cy.get('mat-option').contains(label).click();
    cy.get('[data-cy=spatial-dialog-type] .mat-select-value-text').should('have.text', label);
  }

  static checkErrorDialogMessage(message: string | RegExp) {
    cy.get('[data-cy=error-dialog-content]').contains(message);
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
