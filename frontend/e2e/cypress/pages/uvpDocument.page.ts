import { DocumentPage } from './document.page';
import Chainable = Cypress.Chainable;

export class UvpDocumentPage extends DocumentPage {
  static createUVPDocument(name: string, procedureType: ProcedureTypes) {
    const type = this.getProcedureString(procedureType).toLowerCase().replace(' ', '_');
    cy.log('Create Document: ' + name);
    cy.get(DocumentPage.Toolbar.NewDoc, { timeout: 18000 }).click();
    cy.get(`[data-cy="${type}"]`).click();
    DocumentPage.fillDialog(name);
    // wait, since creation of node leads to activation and navigation, which will result
    // in jumping back to form (in case we jump to another page after creation)
    cy.wait(500);
  }

  static setRequestDate(date: string) {
    cy.get('[data-cy="receiptDate"] input').clear().type(date);
  }

  static setDecisionDate(date: string) {
    cy.get('[data-cy="decisionDate"] input').type(date);
  }

  static setPreliminaryAssessment(performed: boolean) {
    const checkbox = performed ? 'Ja' : 'Nein'; // Vorprüfung durchgeführt ?
    cy.contains('[data-cy="prelimAssessment"] mat-radio-button', checkbox).within(_ =>
      cy.get('input').check({ force: true })
    );
    cy.get('[data-cy="prelimAssessment"] mat-radio-button').should('have.class', 'mat-radio-checked');
  }

  static setUVPnumber(UVPnumber: string) {
    cy.get('[data-cy="eiaNumbers"] mat-select').click().type(UVPnumber);
    cy.get('mat-option').contains(UVPnumber).click();
    cy.get('[data-cy="eiaNumbers"]').should('contain', UVPnumber);
    cy.get('[data-cy="eiaNumbers"] mat-select').invoke('attr', 'aria-expanded').should('eq', 'false');
  }

  static setAddress(addressText: string) {
    cy.get('[data-cy="pointOfContact"]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndSelect(addressText);
    cy.get('[data-cy="choose-address-confirm"]').click();
    // addresses of type person are reformatted
    // cy.get('[data-cy="pointOfContact"]').contains(addressText);
  }

  static addAddressElement(addressElement: AddressDetails, value: string) {
    cy.get('[data-cy="Adresse"] input').eq(addressElement).type(value);
    this.checkAddressElement(addressElement, value);
  }

  static checkAddressElement(addressElement: AddressDetails, value: string) {
    cy.get('[data-cy="address"] input').eq(addressElement).should('have.value', value);
  }

  static addProcedureSteps(content: 'Öffentliche Auslegung' | 'Erörterungstermin' | 'Entscheidung über die Zulassung') {
    cy.contains('ige-uvp-sections button', 'Hinzufügen').click();
    // click the right kind of information (content)
    cy.contains('.mat-menu-panel button', content).click();
    cy.contains('ige-section-wrapper', content).should('exist');
  }

  static verifyUVPmetrics(category: UVPmetrics, value: string) {
    cy.get('[label="Kennzahlen"] .mat-column-value')
      .eq(category)
      .then(extractedValue => {
        expect(extractedValue.text().trim()).to.equal(value);
      });
  }

  static getUVPmetrics(category: UVPmetrics): Chainable<any> {
    return cy
      .get('[label="Kennzahlen"] tbody .mat-column-value')
      .eq(category)
      .then(value => {
        return category === UVPmetrics.averageProcessLength ? value.text().trim() : parseInt(value.text().trim());
      });
  }

  static getUVPNumbermetrics(UVPnumber: string): Chainable<number> {
    return cy
      .contains('[label="Verwendete UVP Nummern"] .mat-row', UVPnumber)
      .children()
      .last()
      .then(value => {
        return parseInt(value.text().trim());
      });
  }

  static goToTabmenu(tabmenu: UVPreports) {
    cy.get(`a.mat-tab-link[data-cy="${tabmenu}"]`, { timeout: 10000 }).click();
    cy.url().should('include', tabmenu);
    cy.wait(1000);
  }

  static downloadReport() {
    cy.get('.download-button button').click();
    cy.wait(3000);
  }

  static getMetricsFromReportPage(): Chainable<string[]> {
    return cy.get('.mat-column-value[role="cell"]').then(element => {
      let arr: string[] = [];
      element.each((index, el) => {
        arr.push(el.innerText.trim());
      });
      return arr;
    });
  }

  static getAllValues(): Chainable<string[]> {
    return cy
      .get('[role="cell"]')
      .not('.mat-column-type')
      .then(element => {
        let arr: string[] = [];
        element.each((index, el) => {
          arr.push(el.innerText.trim());
        });
        console.log(arr);
        return arr;
      });
  }

  static getReportFromFile(): Chainable<String[]> {
    return cy.readFile('cypress/downloads/report.csv').then(content => {
      let raw_content = content.split('\n');
      // delete string with column names
      raw_content.shift();
      // separate elements of single records and flatten arrays with content of lines in one single array
      return raw_content
        .map(function (el: string) {
          return el.split(';').map(elem => elem.trim());
        })
        .flat()
        .filter((elem: any) => elem !== '');
    });
  }

  static tryToAccessFile(id: string, fileName: string, status: 'success' | 'failure') {
    cy.request({
      method: 'HEAD',
      url: `${Cypress.config('baseUrl')}/documents-uvp/${id}/${fileName}`,
      failOnStatusCode: false
    }).then(response => {
      if (status === 'success') {
        expect(response.status).to.equal(200);
      } else {
        expect(response.status).to.be.within(403, 404);
      }
    });
  }

  static setSearchParameter(parameter: 'Verfahrenstyp' | 'UVP Nummer' | 'Verfahrensschritt', value: string) {
    cy.get(`[data-cy="${parameter}"] mat-select`).click();
    cy.contains('.mat-select-panel mat-option', value).click();
    cy.get(`[data-cy="${parameter}"] mat-select`).should('contain', value);
    cy.get(`[data-cy="${parameter}"] mat-select`).invoke('attr', 'aria-expanded').should('eq', 'false');
  }

  static replaceURL(url: string, newURL: string) {
    cy.contains('.mat-table .mat-row', url).find('.mat-checkbox').click();
    cy.findByPlaceholderText('URL').clear().type(newURL);
    cy.contains('button', 'Ersetzen').click();
  }

  static getNumberOfAnalysedURLs(): Chainable<number> {
    return cy.get('.status').then(el => {
      return parseInt(el.text().trim().split('Analysierte URLs: ')[1]);
    });
  }

  static getNumberOfInvalidURLs(): Chainable<number> {
    return cy.get('.mat-column-url.mat-cell').then(coll => coll.length);
  }

  static getProcedureString(procedure: ProcedureTypes): string {
    switch (procedure) {
      case 'Zulassungsverfahren':
        return 'Zulassungsverfahren';
      case 'Negative Vorprüfung':
        return 'Negative Vorprüfung';
      case 'Raumordnungsverfahren':
        return 'Raumordnungsverfahren';
      case 'Linienbestimmung':
        return 'Linienbestimmung';
      case 'Ausländisches Vorhaben':
        return 'Ausländisches Vorhaben';
      case 'Bauleitplanung':
        return 'Bauleitplanung';
    }
  }
}

export enum AddressDetails {
  Street = 1,
  Zipcode,
  City
}

export enum UVPmetrics {
  completedDocs = 0,
  positiveAudit,
  negativeAudit,
  averageProcessLength
}

export enum UVPreports {
  Statistic = 'general',
  Report = 'uvp-bericht',
  URLmanagement = 'url-check',
  UploadCheck = 'uvp-upload-check'
}

export type ProcedureTypes =
  | 'Zulassungsverfahren'
  | 'Negative Vorprüfung'
  | 'Raumordnungsverfahren'
  | 'Linienbestimmung'
  | 'Ausländisches Vorhaben'
  | 'Bauleitplanung';
