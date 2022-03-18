import { CodelistSubMenu } from './base.page';

export class CodelistPage {
  static visit() {
    cy.intercept('GET', 'api/codelist/manage').as('GetCodeList');
    cy.visit('catalogs');
    cy.wait('@GetCodeList');
  }

  static resetCodelistEntries() {
    cy.get('button .mat-button-wrapper').contains('Zurücksetzen').click();
    cy.get('mat-dialog-actions button').contains('Zurücksetzen').click();
    cy.get('[data-cy=error-dialog-content]').should('not.exist');
    cy.wait(100);
  }

  static confirmAddNewEntry() {
    cy.intercept('PUT', /api\/codelist\/manage/).as('addEntry');
    cy.contains('ige-update-codelist mat-dialog-actions span.mat-button-wrapper', 'Hinzufügen').click();
    cy.wait('@addEntry');
  }

  static confirmModifiedEntry() {
    cy.intercept('PUT', /api\/codelist\/manage/).as('modifyEntry');
    cy.get('ige-update-codelist mat-dialog-actions span.mat-button-wrapper').contains('Ändern').click();
    cy.wait('@modifyEntry');
  }

  static deleteCodelistEntry() {
    cy.get('mat-dialog-actions button').contains('Löschen').click();
  }

  static chooseDataFormat(format: Formats) {
    // TODO: replace with BasePage.selectOption()
    cy.get('mat-select').click();
    cy.get('mat-option').contains(format).click();
  }

  static cancelDlg() {
    cy.get('ige-update-codelist > mat-dialog-actions span.mat-button-wrapper').contains('Abbrechen').click();
  }

  static addEntry(entryTitle: string, id = 'TEST', key = 'de') {
    cy.get('[data-cy=codelist-entry-id]').clear().type(id);
    cy.get('button .mat-button-wrapper').contains('Hinzufügen').click();
    cy.get('[data-cy=codelist-entry-key-0]').clear().type(key);
    cy.get('[data-cy=codelist-entry-title-0]').clear().type(entryTitle);
  }

  static addNewEntry(entryTitle: string) {
    cy.get('button .mat-button-wrapper').contains('Hinzufügen').click();
    this.addEntry(entryTitle);
    this.confirmAddNewEntry();
  }

  static changeEntry(entryTitle: string, id: string, key: string) {
    this.addEntry(entryTitle, id, key);
    this.confirmModifiedEntry();
  }

  static checkCodelistEntry(source: string, bool: boolean) {
    if (bool) {
      cy.get('ige-codelist-presenter').should('contain', source);
    } else {
      cy.get('ige-codelist-presenter').should('not.contain', source);
    }
    cy.wait(100);
  }

  static openContextMenu(title: string, tabmenu: CodelistSubMenu) {
    cy.get('mat-expansion-panel-header')
      .contains(title)
      .parent()
      .parent()
      .parent()
      .parent()
      .find('[data-mat-icon-name=Mehr]')
      .click({ force: true })
      .then(_ => {
        cy.get('div.mat-menu-content')
          .should('be.visible')
          .then(_ => {
            cy.get('div.mat-menu-content .mat-menu-item:nth-child(' + tabmenu + ')', { timeout: 10000 }).click();
          });
      });
  }
}

export enum Formats {
  DownloadFormat = 'Download Typ',
  DownloadTyp = 'Download Format',
  mCLOUD = 'mCLOUD Kategorien',
  OpenData = 'OpenData Kategorien'
}
