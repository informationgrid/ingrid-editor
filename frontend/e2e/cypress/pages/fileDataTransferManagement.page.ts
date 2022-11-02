export class fileDataTransferManagement {
  static openUploadDialog(name: string = '', indexOfSection: number = 0) {
    if (name != '') {
      cy.get('.steps')
        .eq(indexOfSection)
        .contains('ige-table-type', name)
        .contains('button', 'Dateien hochladen')
        .click();
    } else {
      cy.contains('button', 'Dateien hochladen').click();
    }
  }

  static openAddURLDialog(name: string = '', indexOfSection: number = 0) {
    if (name != '') {
      cy.get('.steps').eq(indexOfSection).contains('ige-table-type', name).contains('button', 'Link angeben').click();
    } else {
      cy.contains('button', 'Link angeben').click();
    }
  }

  static fillFieldsOfAddURLDialog(title: string, url: string) {
    cy.get('mat-dialog-container input').eq(0).type(title);
    cy.get('mat-dialog-container input').eq(1).type(url);
  }

  static uploadFile(filePath: string, checkExistenceOfContainer: boolean = false, submitDialog: boolean = true) {
    this.addFile(filePath);
    this.assertFileUpload(checkExistenceOfContainer, submitDialog);
  }

  static addFile(filePath: string) {
    cy.intercept('POST', /api\/upload/).as('upload');
    cy.get('[type="file"]').attachFile(filePath);
    cy.wait('@upload', { timeout: 10000 });
    cy.get('.upload-content').should('contain', filePath);
    cy.get('[svgicon="Entfernen"]', { timeout: 8000 }).should('exist');
  }

  static addFileWithRename(filePath: string, newName: string) {
    cy.intercept('POST', /api\/upload/).as('uploadRenamedFile');
    cy.get('[type="file"]').attachFile({ filePath: filePath, fileName: newName });
    cy.wait('@uploadRenamedFile', { timeout: 10000 });
    cy.get('.upload-content').should('contain', newName);
  }

  static addAlreadyExistingFileWithRename(filePath: string, newName: string) {
    cy.intercept('GET', /api\/upload/).as('tryUpload');
    cy.get('[type="file"]').attachFile({ filePath: filePath, fileName: newName });
    cy.wait('@tryUpload', { timeout: 10000 }).should('have.property', 'status', 409);
  }

  static addAlreadyExistingFile(filePath: string) {
    cy.intercept('POST', /api\/upload/).as('tryUpload');
    cy.get('[type="file"]').attachFile(filePath);
    cy.wait('@tryUpload', { timeout: 10000 }).its('response.body.message').should('eq', 'The file already exists.');
    cy.get('.mat-line.mat-error').should('contain', 'Die Datei existiert bereits');
  }

  static assertFileUpload(checkExistenceOfContainer: boolean = false, submitDialog: boolean = true) {
    if (submitDialog) cy.contains('button', 'Übernehmen', { timeout: 8000 }).click();
    if (checkExistenceOfContainer) cy.get('mat-dialog-container').should('not.exist', { timeout: 10000 });
  }

  static unzipArchiveAfterUpload() {
    cy.get('mat-dialog-content .mat-slide-toggle-thumb').click();
    cy.get('mat-dialog-content .mat-slide-toggle-input').invoke('attr', 'aria-checked').should('eq', 'true');
  }

  static removeFileFromUploadDialog() {
    cy.get('[data-mat-icon-name="Entfernen"]').click();
  }

  static DownloadFileAddedToDocument(fileName: string) {
    cy.intercept('GET', /api\/upload/).as('download');
    cy.contains('.no-text-transform', fileName).click();
    cy.wait('@download', { timeout: 10000 });
  }

  static handleExistingFile(action: FileHandlingOptions) {
    cy.intercept('POST', /api\/upload/).as('fileUpload');
    cy.get(action).click();
    if (action === FileHandlingOptions.UseExisting) {
      return;
    }
    cy.wait('@fileUpload', { timeout: 10000 }).its('response.body.success').should('eq', true);
  }

  static solveZIPExtractionConflict(action: FileHandlingOptions) {
    cy.contains('mat-dialog-container', 'Es trat ein Konflikt beim extrahieren der ZIP-Datei auf');
    cy.intercept('GET', /api\/upload\/extract/).as('fileUpload');
    cy.get(action).click();
    cy.wait('@fileUpload', { timeout: 10000 }).its('response.body.success').should('eq', true);
  }

  static verifyExistenceOfDownloadedFile(fileName: string) {
    cy.readFile('cypress/downloads/' + fileName, { timeout: 15000 });
  }

  static checkForOneEntryForTable() {
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 1);
  }
}
export enum FileHandlingOptions {
  Overwrite = 'button:contains("Überschreiben")',
  Rename = 'button:contains("Umbenennen")',
  UseExisting = 'button:contains("Existierende verwenden")'
}
