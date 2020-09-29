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

  static setMcloudSpatialFree(title: string = 'Spaaaaatiaaal', locationText: string = 'Bremen'){
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectMcloudSpatialType('Freier Raumbezug');
    cy.get('[data-cy=spatial-dialog-free]').type(locationText).then(() => {
      cy.get('mat-list :first-child').contains(locationText).click();});
    cy.get('[data-cy=confirm-dialog-save]').click();
  }

  static setMcloudSpatialWKT(title: string = 'Spaaaaatiaaal', locationText: string = 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))'){
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectMcloudSpatialType('WKT');
    cy.get('[data-cy=spatial-dialog-wkt]').type(locationText).then(() => {
      cy.get('div > button').contains('Anzeigen').click();});
    cy.get('[data-cy=confirm-dialog-save]').click();
  }

  static setMcloudSpatialGeoName(title: string = 'Spaaaaatiaaal'){
    cy.get('[data-cy=spatialButton]').click();
    cy.get('[data-cy=spatial-dialog-title]').clear().type(title);
    this.selectMcloudSpatialType('Geografischer Name');
    cy.get('[data-cy=confirm-dialog-save]').click();
  }

  static setMcloudTimeReference(date: string = '23.09.2020', chooseType: string = 'Erstellung'){
    cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Hinzufügen').click();
    // cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Datum').parents('.mat-form-field').type(date);
    cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Typ').parents('.mat-form-field').click();
    cy.get('.mat-option-text').contains(chooseType).click();
    this.selectDate(date);
  }

  static selectDate(date: string){
    const year = date.slice(6,10);
    const monthNumber =  parseInt(date.slice(3,5));
    const day = date.slice(0,2);
    const months = ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
    const month = months[monthNumber-1];

    cy.get('[data-cy="Zeitbezug der Ressource"]').find('[aria-label="Open calendar"]').click();
    cy.get('mat-calendar [aria-label="Choose month and year"]').click();
    cy.get('.mat-calendar-table').contains(year).click();
    cy.get('.mat-calendar-table').contains(month).click();
    cy.get('.mat-calendar-table').contains(day).click();
  }

  static setMcloudPeriodOfTime(chooseOption: string ='am', date: string ='23.9.2020'){
    cy.get('[data-cy=Zeitspanne]').contains('Wählen').click();
    cy.get('.mat-option-text').contains(chooseOption).click();
    cy.get('[data-cy=Zeitspanne] > .display-flex').type(date);
  }

  static setMcloudPeriodicity(chooseOption: string = 'einmalig'){
    cy.get('[data-cy=Periodizität').find('mat-form-field').click();
    cy.get('mat-option').contains(chooseOption).click();
  }
}
