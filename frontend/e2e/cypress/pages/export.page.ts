export class ExportPage {
  static visit() {
    cy.intercept('GET', 'api/tree/children').as('treeCallAddress');
    cy.visit('importExport/export');
    cy.wait('@treeCallAddress', { timeout: 10000 });
    cy.get('.mat-tab-links a').contains('Export').click();
  }

  static continue(waitForPreview: boolean = false) {
    if (waitForPreview) {
      cy.intercept('POST', 'api/export').as('previewJsonData');
      cy.get('div .action-bar').contains('Weiter').click({ force: true });
      cy.wait('@previewJsonData');
    } else {
      cy.contains('button:visible', 'Weiter', { timeout: 8000 }).click();
      // wait for page animation
      cy.wait(300);
    }
  }

  static back() {
    cy.get('div .action-bar').contains('Zurück').click();
  }
  static checkDraftOption() {
    cy.get('form  .mat-checkbox-input').check({ force: true });
  }

  static selectOption(option: string) {
    // TODO: replace with BasePage.selectOption()
    cy.get('form mat-select').click();
    cy.get('mat-option').contains(option).click();
  }

  static selectExportOption(exportOption: string) {
    cy.get('mat-radio-group mat-radio-button ').contains(exportOption).click();
  }

  static cancel() {
    cy.get('div .action-bar').contains('Abbrechen').click();
  }

  static preview() {
    cy.get('ige-export button').contains('Vorschau').click();
  }

  static checkPreviewContent(data: string) {
    cy.contains('mat-dialog-content', data);
  }

  static closePreview() {
    cy.get('[data-cy="confirm-dialog-cancel"]').click();
  }

  static exportFile() {
    cy.get('div .action-bar').contains('Exportieren').click();
  }

  static checkForFileDownload(fileName: string) {
    cy.readFile('cypress\\downloads\\' + fileName, { timeout: 15000 });
    cy.get('ige-export').contains('Die Datei wurde in Ihrem Download-Ordner abgelegt.');
  }

  static newExport() {
    cy.get('div .action-bar').contains('Neuer Export').click();
  }
}
