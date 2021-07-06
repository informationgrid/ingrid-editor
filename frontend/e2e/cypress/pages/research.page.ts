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
      .contains(/[1-9][0-9]* Ergebnisse gefunden/ )
      .then($node => {
        // extract number from string like '12 Ergebnisse gefunden'
        return parseInt($node.text().split(' ')[0]);
      });
  }
}
