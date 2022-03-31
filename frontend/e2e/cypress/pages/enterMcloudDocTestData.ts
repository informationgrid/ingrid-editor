import { DocumentPage } from './document.page';
import { BasePage } from './base.page';

export class enterMcloudDocTestData {
  static setDescription(text: string) {
    cy.get('[data-cy=Beschreibung]').find('mat-form-field').type(text);
    cy.get('[data-cy=Beschreibung] textarea').should('have.value', text);
  }

  static setAddress(addressText: string) {
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndSelect(addressText);
    cy.get('[data-cy="choose-address-confirm"]').click();
    cy.get('[data-cy=Adressen]').contains(addressText);
  }

  static checkAddressSelectable(addressText: string, shouldBeSelectable: boolean) {
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndSelect(addressText);
    cy.get('[data-cy="choose-address-confirm"]').should(shouldBeSelectable ? 'be.enabled' : 'be.disabled');
  }

  static getAddress(address: string) {
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.search(address);
  }

  static setUsageInstructions(text: string) {
    cy.get('[data-cy=Nutzungshinweise]').find('mat-form-field').type(text);
    cy.get('[data-cy=Nutzungshinweise] textarea').should('have.value', text);
  }

  static setCategory(optionText: string, isFirstCategory: boolean = true) {
    if (!isFirstCategory) {
      cy.get('[data-cy="mCLOUD Kategorie"] ige-add-button mat-icon').first().contains('add').click({ force: true });
    } else {
      cy.get('[data-cy="mCLOUD Kategorie"]').contains('Hinzufügen').click();
    }

    cy.get('[data-cy="chip-dialog-option-list"]').contains(optionText).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
    cy.contains('[data-cy="mCLOUD Kategorie"] .mat-chip', optionText);
  }

  static setOpenDataCategory(optionText: string, isFirstCategory: boolean = true) {
    if (!isFirstCategory) {
      cy.get('[data-cy="OpenData Kategorie"] ige-add-button mat-icon').first().contains('add').click({ force: true });
    } else {
      cy.get('[data-cy="OpenData Kategorie"]').contains('Hinzufügen').click();
    }
    cy.get('[data-cy="chip-dialog-option-list"]').contains(optionText).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
    cy.contains('[data-cy="OpenData Kategorie"] .mat-chip', optionText);
  }

  static setAddDownload(titleText: string = 'linkTitel', linkText: string = 'https://docs.cypress.io/api/this') {
    cy.contains('button span', 'Link angeben').click();
    cy.get('input[formcontrolname="title"]').type(titleText);
    cy.get('[formcontrolname="url"]').type(linkText);
    cy.get('input[formcontrolname="title"]').click();
    cy.contains('button', 'Übernehmen').click();
    cy.contains('[data-cy="Downloads-table"]', titleText);
  }

  static editDownload(index: number, data: { type?: string; format?: string }) {
    cy.get('[data-cy=Downloads-table] .mat-row [data-mat-icon-name=Mehr]')
      .click()
      .get('button[role=menuitem]')
      .contains('Bearbeiten')
      .click();

    if (data?.type) {
      // TODO: replace with BasePage.selectOption()
      cy.get('mat-dialog-container mat-select').click();
      cy.get('mat-option').contains(data.type).click();
      cy.wait(500);
    }

    if (data?.format) {
      cy.get('mat-dialog-container input[role=combobox]').clear().type(data.format);
    }

    cy.get('[data-cy=form-dialog-confirm]').click();
  }

  static setLicense(license: string) {
    cy.get('[data-cy=Lizenz] mat-form-field').click();
    cy.get('[data-cy=Lizenz] mat-form-field').type(license);
    cy.get('mat-option').contains(license).click();
    cy.get('[data-cy="Lizenz"] input').should('have.value', license);
  }

  static setSourceNote(text: string) {
    cy.get('[data-cy=Quellenvermerk]').find('mat-form-field').type(text);
    cy.get('[data-cy=Quellenvermerk] textarea').should('have.value', text);
  }

  static setMfund(projectText: string, fkzText: string) {
    cy.get('[data-cy=mFUND]').contains('mFUND Projekt').parents('.mat-form-field').type(projectText);
    cy.get('[data-cy="mFUND"] input').eq(0).should('have.value', projectText);
    cy.get('[data-cy=mFUND]').contains('mFUND Förderkennzeichen').parents('.mat-form-field').type(fkzText);
    cy.get('[data-cy="mFUND"] input').eq(1).should('have.value', fkzText);
  }

  static selectSpatialType(selectType: string) {
    BasePage.selectOption('spatial-dialog-type', selectType);
  }

  static setSpatialBbox(title: string, locationText: string) {
    cy.get('[data-cy=spatialButton]').click();
    this.setOpenedSpatialBbox(title, locationText);
    cy.contains('.spatial-title', locationText);
  }

  static setOpenedSpatialBbox(title: string, locationText: string) {
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectSpatialType('Freier Raumbezug');
    cy.get('[data-cy=spatial-dialog-free]')
      .clear()
      .type(locationText)
      .then(() => {
        cy.intercept('/search/' + locationText + '*').as('waitForSuggestions');
        cy.wait('@waitForSuggestions', { timeout: 8000 });
        cy.contains('.result-wrapper mat-list mat-list-item', locationText, { timeout: 8000 }).click();
      });
    cy.get('[data-cy=confirm-dialog-save]').click();
    // give some time to close dialog and update list
    cy.wait(300);
  }

  static openSpatialMenuDoc(spatialName: string) {
    DocumentPage.clickSpatialEntry(spatialName);
    cy.get('ige-formly--type mat-list')
      .find('.mat-list-item-content:contains(' + spatialName + ') [data-mat-icon-name=Mehr]')
      .click();
  }

  static selectChangeInSpatialMenuDoc() {
    cy.get('[role="menu"]').contains('Bearbeiten').click();
  }

  static deleteSpatialReference(text: string) {
    this.selectDeleteInSpatialMenuDoc();
    cy.get('mat-dialog-content').contains(text);
    cy.get('[data-cy="confirm-dialog-ok"]').click();
  }

  private static selectDeleteInSpatialMenuDoc() {
    cy.get('[role="menu"]').contains('Löschen').click();
  }

  static setSpatialWKT(
    title: string = 'Spaaaaatiaaal',
    locationText: string = 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))'
  ) {
    cy.get('[data-cy=spatialButton]').click();
    this.setOpenedSpatialWKT(title, locationText);
  }

  static setOpenedSpatialWKT(title: string, locationText: string) {
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectSpatialType('Raumbezug (WKT)');
    cy.get('[data-cy=spatial-dialog-wkt]')
      .clear()
      .type(locationText)
      .then(() => {
        cy.get('div > button').contains('Anzeigen').click();
      });
    cy.get('[data-cy=confirm-dialog-save]').click();
    DocumentPage.checkSpatialEntrytNotEmpty();
    // give some time to close dialog and update list
    cy.wait(300);
  }

  static setSpatialGeoName(title: string) {
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectSpatialType('Nur Titel');
    cy.get('[data-cy=confirm-dialog-save]').click();
    DocumentPage.checkSpatialEntrytNotEmpty();
  }

  static setTimeReference(date: Date, choose: string, index: number = 0) {
    cy.get('[data-cy="Zeitbezug der Ressource"] ige-add-button button').click();
    cy.get('[data-cy="Zeitbezug der Ressource"] ige-repeat ')
      .find('mat-select')
      .eq(index)

      .click({ force: true });
    cy.get('.mat-option-text').contains(choose).click();
    this.selectDate('[data-cy="Zeitbezug der Ressource"]', date, choose, undefined, index);
  }

  static selectDate(area: string, date: Date, choose: string, until?: Date, index: number = 0) {
    const year = date.getFullYear();
    const monthNumber = date.getMonth();
    const day = date.getDate();
    const months = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
    const month = months[monthNumber - 1];

    if (choose === 'von - bis' && until) {
      const year2 = until.getFullYear();
      const monthNumber2 = until.getMonth() + 1;
      const day2 = until.getDate();
      const month2 = months[monthNumber2 - 1];

      cy.get(area).find('mat-form-field mat-datepicker-toggle button').last().click();
      this.selectDateInCalendar(year, month, day);
      this.selectDateInCalendar(year2, month2, day2);
    } else {
      cy.get(area).find('mat-form-field mat-datepicker-toggle button').eq(index).click();
      this.selectDateInCalendar(year, month, day);
    }
  }

  private static selectDateInCalendar(setYear: number, setMonth: string, setDay: number) {
    cy.get('mat-calendar [aria-label="Choose month and year"]').click();
    cy.get('.mat-calendar-table').contains(setYear).click();
    cy.get('.mat-calendar-table').contains(setMonth).click();
    cy.get('.mat-calendar-table').contains(setDay).click();
  }

  static setPeriodOfTime(choose: string = 'am', date: Date, until?: Date) {
    cy.get('[data-cy=Zeitspanne]').contains('Wählen').click();
    if (choose === '') {
      cy.get('.mat-option-text:empty').parent().click();
    } else {
      cy.get('.mat-option-text').contains(choose).click();
    }
    cy.wait(0);
    this.selectDate('[data-cy="Zeitspanne"]', date, choose, until);
  }

  static checkPeriodOfTimeSelectedValue(option: string) {
    if (option === '') {
      cy.get('.mat-select-value').should('have.value', option);
    } else {
      cy.get('.mat-select-value').contains(option);
    }
  }

  static setPeriodicity(chooseOption: string) {
    cy.get('[data-cy=Periodizität').find('mat-form-field').click();
    cy.get('mat-option').contains(chooseOption).click();
    cy.get('[data-cy="Periodizität"] .mat-select-min-line').should('contain', chooseOption);
  }

  static enterNecessaryData() {
    this.setDescription('test description');
    this.setAddress('Published Testorganization');
    this.setCategory('Bahn');
    this.setOpenDataCategory('Verkehr');
    this.setAddDownload();
    this.editDownload(1, { type: 'AtomFeed' });
    this.setLicense('Andere offene Lizenz');
  }

  static openDownloadDialog() {
    cy.contains('button', 'Dateien hochladen').click();
  }

  static openAddURLDialog() {
    cy.contains('button', 'Link angeben').click();
  }

  static fillFieldsOfAddURLDialog(title: string, url: string) {
    cy.get('input[formcontrolname="title"]').type(title);
    cy.get('[formcontrolname="url"]').type(url);
    //cy.get('input[formcontrolname="title"]').click();
  }

  static uploadFile(filePath: string) {
    this.addFile(filePath);
    this.assertFileUpload();
  }

  static addFile(filePath: string) {
    cy.intercept('POST', /api\/upload/).as('upload');
    cy.get('[type="file"]').attachFile(filePath);
    cy.wait('@upload', { timeout: 10000 });
    cy.get('.upload-content').should('contain', filePath);
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

  static assertFileUpload() {
    cy.contains('button', 'Übernehmen').click();
  }

  static unzipArchiveAfterUpload() {
    cy.get('mat-dialog-content .mat-slide-toggle-thumb').click();
    cy.get('mat-dialog-content .mat-slide-toggle-input').invoke('attr', 'aria-checked').should('eq', 'true');
  }

  static removeFileFromUploadDialog() {
    cy.intercept('DELETE', /api\/upload/).as('deleteFile');
    cy.get('[data-mat-icon-name="Entfernen"]').click();
    cy.wait('@deleteFile');
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
}

export enum FileHandlingOptions {
  Overwrite = 'button:contains("Überschreiben")',
  Rename = 'button:contains("Umbenennen")',
  UseExisting = 'button:contains("Existierende verwenden")'
}
