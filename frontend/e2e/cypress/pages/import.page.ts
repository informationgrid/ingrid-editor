export class ImportPage {
  static visit() {
    cy.intercept('GET', /api\/import\?profile=mcloud/).as('getImportPage');
    cy.visit('/importExport/import');
    cy.wait('@getImportPage', { timeout: 20000 });
  }

  static addFile(filePath: string) {
    cy.intercept('POST', /api\/import\/analyze/).as('upload');
    cy.get('[type="file"]').attachFile(filePath);
    cy.wait('@upload', { timeout: 10000 });
    cy.get('.success-color');
  }

  static tryAddFileInWrongFormat(filePath: string) {
    cy.intercept('POST', /api\/import\/analyze/).as('tryUpload');
    cy.get('[type="file"]').attachFile(filePath);
    cy.wait('@tryUpload', { timeout: 10000 }).its('response.statusCode').should('equal', 500);
  }

  static continue() {
    cy.contains('button:visible', 'Weiter', { timeout: 8000 }).click();
    // wait for page animation
    cy.wait(300);
  }

  static chooseImportOption(option: ImportOptions) {
    cy.get(' mat-radio-button [value="' + option + '"]').click({ force: true });
  }

  static closeDialogAndImport() {
    cy.intercept('POST', '/api/import').as('importData');
    cy.contains('button', 'Importieren').click();
    cy.wait('@importData');
  }

  static jumpToDocument(docName: string) {
    cy.contains('button', 'Öffnen').click();
    cy.get('.title', { timeout: 7000 }).should('contain', docName);
  }
}

export enum ImportOptions {
  OverwriteMetadata = 'overwrite_identical',
  CreateUnderTarget = 'create_under_target'
}
