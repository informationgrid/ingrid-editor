import Chainable = Cypress.Chainable;

export class DashboardPage {
  static url = '/dashboard';

  static visit() {
    cy.visit('/dashboard');
  }

  static getLatestDocTitle(position: number) {
    return cy
      .get(`[data-cy=card-latest-docs] .mat-selection-list > :nth-child(${position}) .card-title`)
      .invoke('text');
  }

  static clickOnLatestDoc(position: number) {
    cy.get(`[data-cy=card-latest-docs] .mat-selection-list > :nth-child(${position})`).click();
  }

  static search(query: string) {
    cy.intercept('GET', '/api/datasets?*').as('searchRequest');
    cy.get('ige-quick-search input', { timeout: 10000 }).type(query);
    cy.wait('@searchRequest');
  }

  static clearSearch() {
    return cy.get('ige-quick-search [svgicon=Entfernen]').click();
  }

  static getSearchResult(position: number): Chainable {
    return cy.get(`.mat-autocomplete-panel mat-option:nth-of-type(${position})`);
  }
}
