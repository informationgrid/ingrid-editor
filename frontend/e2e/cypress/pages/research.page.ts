import Chainable = Cypress.Chainable;

export class ResearchPage {
  static url = '/research';

  static visit() {
    cy.visit('/research');
  }

  static getSearchResultCount(): Chainable<number> {
    return cy
      .get('.result')
      .contains('Ergebnisse gefunden')
      .then($node => {
        // extract number from string like '12 Ergebnisse gefunden'
        return parseInt($node.text().split(' ')[0]);
      });
  }
}
