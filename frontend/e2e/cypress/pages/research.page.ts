import Chainable = Cypress.Chainable;

export class ResearchPage {
  static url = '/research';

  static visit() {
    cy.visit('/research');
  }

  static search(query: string) {
    //return cy.get('ige-quick-search input', { timeout: 10000 }).type(query).wait(300);
    return cy.get('.mat-form-field-infix > .mat-input-element').type(query).wait(500);
  }

  /**
   * Returns the searchresultcount. Fails if searchresultcount is 0
   */
  static getSearchResultCount(): Chainable<number> {
    return cy
      .get('.result')
      .contains(/[1-9][0-9]* Ergebnisse gefunden/)
      .then($node => {
        // extract number from string like '12 Ergebnisse gefunden'
        return parseInt($node.text().split(' ')[0]);
      });
  }

  static toggleSearchFilter(docType: string): void {
    cy.get('.main-header .mat-select').click();
    cy.get('.mat-option-text').contains(docType).click();
    // wait For request to complete
    cy.intercept('**/api/search/query').as('query');
    cy.wait('@query');
  }

  static checkboxSearchFilter(FilterType: FilterExtendedSearch): void {
    //without forcing cypress to click it doesn't find checkbox
    cy.get(FilterType).click({ force: true });
  }
}

export enum FilterExtendedSearch {
  OnlyPublished = '.mat-checkbox-inner-container > input[name="selectPublished"]',
  NoFolders = '.mat-checkbox-inner-container > input[name="exceptFolders"]',
  mCloud = '.mat-checkbox-inner-container > input[name="selectDocMCloud"]',
  Test = '.mat-checkbox-inner-container > input[name="selectDocTest"]'
}
