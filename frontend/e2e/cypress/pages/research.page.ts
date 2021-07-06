import Chainable = Cypress.Chainable;

export class ResearchPage {
  static url = '/research';

  static visit() {
    cy.visit('/research');
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
}
