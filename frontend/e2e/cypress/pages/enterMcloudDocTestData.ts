import { Utils } from './utils';
import { DocumentPage } from './document.page';

export class enterMcloudDocTestData {
  static setDescription(text: string = 'Testbeschreibung') {
    cy.get('[data-cy=Beschreibung]').find('mat-form-field').type(text);
  }

  static setAddress(addressText: string, addressType: string = 'Herausgeber') {
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndAdd(addressText, addressType);
    cy.get('[data-cy=Adressen]').contains(addressText);
  }

  static getAddress() {
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.search('Published Testorganization');
  }

  static setUsageInstructions(text: string = 'Nutzungshinweise') {
    cy.get('[data-cy=Nutzungshinweise]').find('mat-form-field').type(text);
  }

  static setCategory(optionText: string = 'Bahn') {
    cy.get('[data-cy="mCLOUD Kategorie"]').contains('Hinzufügen').click();
    cy.get('[data-cy="chip-dialog-option-list"]').contains(optionText).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
  }

  static setOpenDataCategory(optionText: string = 'Verkehr') {
    cy.get('[data-cy="OpenData Kategorie"]').contains('Hinzufügen').click();
    cy.get('[data-cy="chip-dialog-option-list"]').contains(optionText).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
  }

  static setAddDownload(
    titleText: string = 'linkTitel',
    linkText: string = 'link.link',
    typeText: string = 'linktyp',
    formatText: string = '.py'
  ) {
    cy.get('[data-cy="Downloads-add"]').contains('Hinzufügen').click();
    cy.get('[data-cy="form-dialog-content"]').contains('Titel').parent().parent().type(titleText);
    cy.get('[data-cy="form-dialog-content"]').contains('Link').parent().parent().type(linkText);
    cy.get('[data-cy="form-dialog-content"]').contains('Typ').parent().parent().type(typeText);
    cy.get('[data-cy="form-dialog-content"]').contains('Datenformat').parent().parent().type(formatText);
    cy.get('[data-cy="form-dialog-confirm"]').click();
  }

  static setLicense(license: string = 'Andere offene Lizenz') {
    cy.get('[data-cy=Lizenz] mat-form-field').click();
    cy.get('[data-cy=Lizenz] mat-form-field').type(license);
    cy.get('mat-option').contains(license).click();
  }

  static setSourceNote(text?: string) {
    if (text == null) {
      text = Utils.randomString();
      cy.get('[data-cy=Quellenvermerk]').find('mat-form-field').type(text);
    } else if (text != null) {
      cy.get('[data-cy=Quellenvermerk]').find('mat-form-field').type(text);
    }
  }

  static setMfund(projectText: string = 'Projekt', fkzText: string = 'Förderkennzeichen') {
    cy.get('[data-cy=mFUND]').contains('mFUND Projekt').parents('.mat-form-field').type(projectText);
    cy.get('[data-cy=mFUND]').contains('mFUND Förderkennzeichen').parents('.mat-form-field').type(fkzText);
  }

  static selectSpatialType(selectType: string) {
    cy.get('[data-cy=spatial-dialog-type]').click();
    cy.get('mat-option').contains(selectType).click();
  }

  /*
     TODO: this should be put in a separate dialog class (see for example DocumentPage.CreateDialog)
           this class can be handled better and be used more intuitively
   */
  static setSpatialBbox(title: string = 'Spaaaaatiaaal', locationText: string = 'Bremen') {
    cy.get('[data-cy=spatialButton]').click();
    this.setOpenedSpatialBbox(title, locationText);
  }

  static setOpenedSpatialBbox(title: string, locationText: string) {
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectSpatialType('Freier Raumbezug');
    cy.get('[data-cy=spatial-dialog-free]')
      .clear()
      .type(locationText)
      .then(() => {
        cy.get('.result-wrapper mat-list', { timeout: 10000 }).contains(locationText).click();
      });
    cy.get('[data-cy=confirm-dialog-save]').click();
    // give some time to close dialog and update list
    cy.wait(300);
  }

  static openSpatialMenuDoc(spatialName: string) {
    DocumentPage.clickSpatialEntry(spatialName);
    cy.get('ige-formly--type mat-list')
      .find('.mat-list-item-content:contains(' + spatialName + ') [data-mat-icon-name="Mehr"]')
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
    this.selectSpatialType('WKT');
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

  static setSpatialGeoName(title: string = 'Spaaaaatiaaal') {
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectSpatialType('Geografischer Name');
    cy.get('[data-cy=confirm-dialog-save]').click();
    DocumentPage.checkSpatialEntrytNotEmpty();
  }
  // *****************************************************

  static setTimeReference(date: Date = new Date(2020, 1, 11), choose: string = 'Erstellung') {
    cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Hinzufügen').click();
    // check if 'Hinzufügen'-Button is clicked and to slow it down for the next step
    cy.get('[data-cy="Zeitbezug der Ressource"] [svgicon=Entfernen]').should('not.be.disabled');
    cy.get('[data-cy="Zeitbezug der Ressource"] ige-repeat mat-form-field').contains('Typ').click({force: true});
    cy.get('.mat-option-text').contains(choose).click();
    this.selectDate('[data-cy="Zeitbezug der Ressource"]', date, choose);
  }

  static selectDate(area: string, date: Date, choose: string, until?: Date) {
    const year = date.getFullYear();
    const monthNumber = date.getMonth();
    const day = date.getDate();
    const months = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
    const month = months[monthNumber - 1];

    // TODO: always use strict equality operator '===' and '!==' (check whole code!)
    //       (see: https://developer.mozilla.org/de/docs/Web/JavaScript/Vergleiche_auf_Gleichheit_und_deren_Verwendung)
    if (choose == 'von - bis' && until != null) {
      const year2 = until.getFullYear();
      const monthNumber2 = until.getMonth() + 1;
      const day2 = until.getDate();
      const month2 = months[monthNumber2 - 1];

      cy.get(area).find('mat-form-field mat-datepicker-toggle button').last().click();
      this.selectDateInCalendar(year, month, day);
      this.selectDateInCalendar(year2, month2, day2);
    } else {
      cy.get(area).find('mat-form-field mat-datepicker-toggle button').first().click();
      this.selectDateInCalendar(year, month, day);
    }
  }

  private static selectDateInCalendar(setYear: number, setMonth: string, setDay: number) {
    cy.get('mat-calendar [aria-label="Choose month and year"]').click();
    cy.get('.mat-calendar-table').contains(setYear).click();
    cy.get('.mat-calendar-table').contains(setMonth).click();
    cy.get('.mat-calendar-table').contains(setDay).click();
  }

  static setPeriodOfTime(choose: string = 'am', date: Date = new Date(2020, 1, 11), until?: Date) {
    cy.get('[data-cy=Zeitspanne]').contains('Wählen').click();
    cy.get('.mat-option-text').contains(choose).click();
    cy.wait(0);
    this.selectDate('[data-cy="Zeitspanne"]', date, choose, until);
  }

  static setPeriodicity(chooseOption: string = 'einmalig') {
    cy.get('[data-cy=Periodizität').find('mat-form-field').click();
    cy.get('mat-option').contains(chooseOption).click();
  }

  static enterFullData() {
    const dateNow = new Date();
    const previousDate = new Date(2020, 1, 11);

    enterMcloudDocTestData.setDescription();
    enterMcloudDocTestData.setAddress('Published Testorganization');
    enterMcloudDocTestData.setUsageInstructions();
    enterMcloudDocTestData.setCategory();
    enterMcloudDocTestData.setOpenDataCategory();
    enterMcloudDocTestData.setAddDownload();
    enterMcloudDocTestData.setLicense();
    enterMcloudDocTestData.setSourceNote();
    enterMcloudDocTestData.setMfund();
    enterMcloudDocTestData.setSpatialWKT();
    enterMcloudDocTestData.setTimeReference();
    enterMcloudDocTestData.setPeriodOfTime('von - bis', previousDate, dateNow);
    enterMcloudDocTestData.setPeriodicity();
  }

  static enterNecessaryData() {
    enterMcloudDocTestData.setDescription();
    enterMcloudDocTestData.setAddress('Published Testorganization');
    enterMcloudDocTestData.setCategory();
    enterMcloudDocTestData.setOpenDataCategory();
    enterMcloudDocTestData.setAddDownload();
    enterMcloudDocTestData.setLicense();
  }

  // static verifyAllTestData() {
  //   cy.get('[data-cy=Beschreibung]').should('not.empty');
  //   cy.get('[data-cy=Adressen]').should('not.empty');
  //   cy.get('[data-cy=Nutzungshinweise]').should('not.empty');
  //   cy.get('[data-cy="mCLOUD Kategorie"]').should('not.empty');
  //   cy.get('[data-cy="OpenData Kategorie"]').should('not.empty');
  //   cy.get('[data-cy="Downloads-add"]').should('not.empty');
  //   cy.get('[data-cy=Lizenz]').should('not.empty');
  //   cy.get('[data-cy=Quellenvermerk]').should('not.empty');
  //   cy.get('[data-cy=mFUND]').should('not.empty');
  //   // spatial
  //   // Zeitbezug
  //   // Zeitspanne
  //   // Periodizität
  // }
}
