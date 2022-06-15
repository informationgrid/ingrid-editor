import { DocumentPage } from './document.page';
import { Utils } from './utils';
import { Tree } from './tree.partial';
import { UserAndRights } from './base.page';
import Chainable = Cypress.Chainable;

export class uvpPage {
  static setDescription(text: string) {
    cy.get('[data-cy="Allgemeine Vorhabenbeschreibung"] textarea').type(text);
    cy.get('[data-cy="Allgemeine Vorhabenbeschreibung"] textarea').should('have.value', text);
  }

  static setDateOfRequest(date: string) {
    cy.get('[data-cy="Eingang des Antrags"] input').type(date);
    cy.get('[data-cy="Eingang des Antrags"] input').should('have.value', date);
  }

  static setDecisionDate(date: string) {
    cy.get('[data-cy="Datum der Entscheidung"] input').type(date);
    cy.get('[data-cy="Datum der Entscheidung"] input').should('have.value', date);
  }

  static IsPreliminaryAssessment(answer: 'Ja' | 'Nein') {
    cy.contains('[data-cy="Vorprüfung durchgeführt"] mat-radio-button', answer).within(_ =>
      cy.get('input').check({ force: true })
    );
    cy.get('[data-cy="Vorprüfung durchgeführt"] mat-radio-button').should('have.class', 'mat-radio-checked');
  }

  static setUVPnumber(UVPnumber: string) {
    cy.get('[data-cy="UVP-Nummern"] mat-select')
      .click()
      .type(UVPnumber + '{enter}');
    cy.get('[data-cy="UVP-Nummern"]').should('contain', UVPnumber);
    cy.get('[data-cy="UVP-Nummern"] mat-select').invoke('attr', 'aria-expanded').should('eq', 'false');
  }

  static setAddress(addressText: string) {
    cy.get('[data-cy="Kontaktdaten der verfahrensführenden Behörde"]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndSelect(addressText);
    cy.get('[data-cy="choose-address-confirm"]').click();
    cy.get('[data-cy="Kontaktdaten der verfahrensführenden Behörde"]').contains(addressText);
  }

  static addAddressElement(addressElement: AddressDetails, value: string) {
    cy.get('[data-cy="Adresse"] input').eq(addressElement).type(value);
    this.checkAddressElement(addressElement, value);
  }

  static checkAddressElement(addressElement: AddressDetails, value: string) {
    cy.get('[data-cy="Adresse"] input').eq(addressElement).should('have.value', value);
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
      .get('[label="Kennzahlen"] .mat-column-value')
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
    cy.get('a.mat-tab-link[href="' + tabmenu + '"]', { timeout: 10000 }).click();
    cy.contains('.page-title', 'UVP Bericht', { timeout: 10000 }).should('exist');
    cy.get('[label="Kennzahlen"] tbody', { timeout: 8000 }).should('exist');
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
}

export enum AddressDetails {
  Street = 1,
  Zipcode,
  City
}

export enum UVPmetrics {
  positiveAudit = 1,
  negativeAudit,
  averageProcessLength
}

export enum UVPreports {
  Statistic = '/reports/general',
  Report = '/reports/uvp-bericht'
}
