import {Utils} from "./utils";
import {DocumentPage} from "./document.page";

export class enterTestDataSteps {

  static setMcloudDescription(text: string = 'Testbeschreibung'){
    cy.get('[data-cy=Beschreibung]').find('mat-form-field').type(text);
  }

  static setMcloudAddress(addressText: string, addressType: string = 'Herausgeber'){
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndAdd(addressText, addressType);
    cy.get('[data-cy=Adressen]').contains(addressText);
    }

  static getMCloudAddress(){
    cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.search('Published Testorganization')
  }

  static setMcloudUsageInstructions(text: string = 'Nutzungshinweise'){
    cy.get('[data-cy=Nutzungshinweise]').find('mat-form-field').type(text);
  }

  static setMcloudCategory(optionText: string = 'Bahn'){
    cy.get('[data-cy="mCLOUD Kategorie"]').contains('Hinzufügen').click();
    cy.get('[data-cy="chip-dialog-option-list"]').contains(optionText).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
  }

  static setMcloudOpenDataCategory(optionText: string = 'Verkehr'){
    cy.get('[data-cy="OpenData Kategorie"]').contains('Hinzufügen').click();
    cy.get('[data-cy="chip-dialog-option-list"]').contains(optionText).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
  }

  static setMcloudAddDownload(titleText: string = 'linkTitel', linkText: string = 'link.link', typeText: string = 'linktyp', formatText: string = '.py'){
    cy.get('[data-cy="Downloads-add"]').contains('Hinzufügen').click();
    cy.get('[data-cy="form-dialog-content"]').contains('Titel').parent().parent().type(titleText);
    cy.get('[data-cy="form-dialog-content"]').contains('Link').parent().parent().type(linkText);
    cy.get('[data-cy="form-dialog-content"]').contains('Typ').parent().parent().type(typeText);
    cy.get('[data-cy="form-dialog-content"]').contains('Datenformat').parent().parent().type(formatText);
    cy.get('[data-cy="form-dialog-confirm"]').click();
  }

  static setMcloudLicense(license: string = 'Andere offene Lizenz'){
    cy.get('[data-cy=Lizenz] mat-form-field').click();
    cy.get('[data-cy=Lizenz] mat-form-field').type(license);
    cy.get('mat-option').contains(license).click();
  }

  static setMcloudSourceNote(text?: string){
    if (text == null) {
      text = Utils.randomString();
      cy.get('[data-cy=Quellenvermerk]').find('mat-form-field').type(text);
    } else if (text != null) {
      cy.get('[data-cy=Quellenvermerk]').find('mat-form-field').type(text);
    }
  }

  static setMcloudMfund (projectText: string = 'Projekt', fkzText: string = 'Förderkennzeichen'){
      cy.get('[data-cy=mFUND]').contains('mFUND Projekt').parents('.mat-form-field').type(projectText);
      cy.get('[data-cy=mFUND]').contains('mFUND Förderkennzeichen').parents('.mat-form-field').type(fkzText);
    }

  static selectMcloudSpatialType(selectType: string){
    cy.get('[data-cy=spatial-dialog-type]').click();
    cy.get('mat-option').contains(selectType).click();
  }

  static setMcloudSpatialBbox(title: string = 'Spaaaaatiaaal', locationText: string = 'Bremen'){
    // if ('ige-spatial-dialog mat-dialog-content:visible'){
    //   this.handleMcloudSpatialBboxInput(title, locationText);
    // } else if (!'ige-spatial-dialog mat-dialog-content:visible'){
    //   cy.get('[data-cy=spatialButton]').click();
    //   this.handleMcloudSpatialBboxInput(title, locationText);
    // }
    cy.get('[data-cy=spatialButton]').click();
    this.setOpenedMcloudSpatialBbox(title, locationText);
  }

  static setOpenedMcloudSpatialBbox(title: string, locationText: string){
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectMcloudSpatialType('Freier Raumbezug');
    cy.get('[data-cy=spatial-dialog-free]').type(locationText).then(() => {
      cy.get('mat-list').contains(locationText).click();});
    cy.get('[data-cy=confirm-dialog-save]').click();
    DocumentPage.checkSpatialEntrytNotEmpty()
  }

  static openSpatialMenuMcloudDoc(spatialName: string){
    DocumentPage.clickSpatialEntry(spatialName);
    cy.get('ige-formly--type mat-list').find('.mat-list-item-content:contains(' + (spatialName) + ') [data-mat-icon-name="Mehr"]').click();
  }

  static selectChangeInSpatialMenuMcloudDoc(){
    cy.get('[role="menu"]').contains('Bearbeiten').click();
  }

  static deleteSpatialReference(text: string){
    this.selectDeleteInSpatialMenuMcloudDoc()
    cy.get('mat-dialog-content').contains(text);
    cy.get('[data-cy="confirm-dialog-ok"]').click();
  }

  private static selectDeleteInSpatialMenuMcloudDoc(){
    cy.get('[role="menu"]').contains('Löschen').click();
  }

  static setMcloudSpatialWKT(title: string = 'Spaaaaatiaaal', locationText: string = 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))'){
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectMcloudSpatialType('WKT');
    cy.get('[data-cy=spatial-dialog-wkt]').type(locationText).then(() => {
      cy.get('div > button').contains('Anzeigen').click();});
    cy.get('[data-cy=confirm-dialog-save]').click();
    DocumentPage.checkSpatialEntrytNotEmpty()
  }

  static setMcloudSpatialGeoName(title: string = 'Spaaaaatiaaal'){
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectMcloudSpatialType('Geografischer Name');
    cy.get('[data-cy=confirm-dialog-save]').click();
    DocumentPage.checkSpatialEntrytNotEmpty()
  }

  static setMcloudTimeReference(date: Date = new Date(2020,1,11), choose: string = 'Erstellung'){
    cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Hinzufügen').click();
    // cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Datum').parents('.mat-form-field').type(date);
    cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Typ').parents('.mat-form-field').click();
    cy.get('.mat-option-text').contains(choose).click();
    this.selectDate('[data-cy="Zeitbezug der Ressource"]', date, choose);
  }

  static selectDate(area: string, date: Date, choose: string, until?: Date){
    const year = date.getFullYear();
    const monthNumber =  date.getMonth();
    const day = date.getDate();
    const months = ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
    const month = months[monthNumber-1];

    if (choose == 'von - bis' && until !=null){
      const year2 = until.getFullYear();
      const monthNumber2 =  until.getMonth() + 1;
      const day2 = until.getDate();
      const month2 = months[monthNumber2-1];

      cy.get(area).find('mat-form-field mat-datepicker-toggle button').last().click();
      this.selectDateInCalendar(year, month, day);
      this.selectDateInCalendar(year2, month2, day2);
    } else {
      cy.get(area).find('mat-form-field mat-datepicker-toggle button').first().click();
      this.selectDateInCalendar(year, month, day);
    }
  }

  private static selectDateInCalendar (setYear: number, setMonth: string, setDay: number ){
    cy.get('mat-calendar [aria-label="Choose month and year"]').click();
    cy.get('.mat-calendar-table').contains(setYear).click();
    cy.get('.mat-calendar-table').contains(setMonth).click();
    cy.get('.mat-calendar-table').contains(setDay).click();
  }

  static setMcloudPeriodOfTime(choose: string ='am', date: Date = new Date(2020,1,11), until?: Date){
    cy.get('[data-cy=Zeitspanne]').contains('Wählen').click();
    cy.get('.mat-option-text').contains(choose).click();
    cy.wait(0);
    this.selectDate('[data-cy="Zeitspanne"]', date, choose, until);
  }

  static setMcloudPeriodicity(chooseOption: string = 'einmalig'){
    cy.get('[data-cy=Periodizität').find('mat-form-field').click();
    cy.get('mat-option').contains(chooseOption).click();
  }
}
