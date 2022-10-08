import Chainable = Cypress.Chainable;

export class DashboardPage {
  static url = '/dashboard';

  static visit() {
    cy.intercept({ method: 'GET', url: 'api/statistic', times: 1 }).as('getStatistic');
    cy.visit('/dashboard');
    cy.wait('@getStatistic', { timeout: 12000 });
  }

  static getLatestDocTitle(position: number) {
    return cy
      .get(`[data-cy=card-latest-docs] .mat-selection-list > :nth-child(${position}) .card-title`, { timeout: 9000 })
      .invoke('text');
  }

  static getLatestDocEditTime(position: number) {
    return cy
      .get(`[data-cy=card-latest-docs] .mat-selection-list > :nth-child(${position}) .card-title`, { timeout: 9000 })
      .next()
      .invoke('text');
  }

  static clickOnLatestDoc(position: number) {
    cy.get(`[data-cy=card-latest-docs] .mat-selection-list > :nth-child(${position})`).click();
  }

  static search(query: string) {
    cy.intercept({ method: 'POST', url: '/api/search/query', times: 1 }).as('searchRequest');
    cy.get('ige-quick-search input', { timeout: 10000 }).type(query);
    cy.wait('@searchRequest');
  }

  static clearSearch() {
    return cy.get('ige-quick-search [svgicon=Entfernen]').click();
  }

  static getSearchResult(position: number): Chainable {
    return cy.get(`.mat-autocomplete-panel mat-option:nth-of-type(${position})`);
  }

  static getCount(selector: string): Chainable<number> {
    return cy.get(selector).then($node => {
      return parseInt($node.text().trim());
    });
  }

  static startShortcutAction(option: Shortcuts) {
    cy.contains('.shortcut button', option, { timeout: 10000 }).click();
  }

  static verifyCreateBoxTitle(text: CreateBoxHeadings) {
    cy.get('mat-dialog-container').should('exist');
    cy.get('div.mat-dialog-title').should('contain', text);
  }

  static draftedDocuments = '.box.working .count';
  static publishedDocuments = '.box .count';
  static totalDisplay = '.circular-chart .text';
}

export enum Shortcuts {
  NewFolder = 'Neuer Ordner',
  NewAddress = 'Neue Adresse',
  NewDataset = 'Neuer Datensatz',
  NewSubfolder = 'Neuer Unterordner',
  ImportDataset = 'Datensatz importieren',
  ImportAddress = 'Adressen Import'
}

export enum CreateBoxHeadings {
  NewFolder = 'Neuen Ordner anlegen',
  NewAddress = 'Neue Adresse anlegen',
  NewDataset = 'Neuen Datensatz anlegen'
}
