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

  static openSearchOptionTab(option: SearchOptionTabs) {
    cy.get('.mat-ripple.mat-tab-label:nth-child(' + option + ')').click();
  }

  static openContextMenuSpatialReference(action: contextActionSpatial) {
    cy.get('div.location').find('button').click();
    cy.get('div.mat-menu-content > button:nth-child(' + action + ')').click();
  }

  static openContextMenuOfSearchResult(name: string, action: contextActionSearchResult) {
    cy.contains('td', name).parent().find('button').click();
    cy.get('div.mat-menu-content > button').eq(action).click();
  }

  //check first radio button, only if a list with suggestions is offered
  static chooseLocationSuggestionByRadioButton() {
    //wait for the list of suggestions to appear
    cy.intercept({
      method: 'GET',
      path: '/search/*'
    }).as('waitForSuggestions');
    cy.wait('@waitForSuggestions');
    //check if there are result suggestions in the corresponding field, if so: click the first suggestion
    cy.get('mat-list.mat-list-base').then(resultField => {
      if (resultField.find('mat-list-item.mat-list-item').length > 0) {
        cy.get('mat-list.mat-list-base:nth-child(1)').click();
      }
    });
  }

  //when the dropdown menu will contain more than one option: TODO use parameter "type" to choose
  static createSpatialReference(location: string, title = 'testSpatial', type = 'freeSpatialRef') {
    cy.get('ige-facets').find('.btn-title').should('contain', 'Hinzufügen').click(); //click "Hinzufügen"
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Suchen"]').type(`${location}`); //search term
    this.chooseLocationSuggestionByRadioButton();
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Eingeben..."]').type(`${title}`); //title
    cy.get('ige-spatial-dialog').find('[data-cy="confirm-dialog-save"]').click(); //close editing window
  }

  static editSpatialReference(location: string, title = 'testSpatial', type = 'freeSpatialRef') {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Edit);
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Suchen"]').type(`${location}`); //search term
    this.chooseLocationSuggestionByRadioButton();
    cy.get('ige-spatial-dialog').find('[data-cy="confirm-dialog-save"]').click(); //close editing window
  }

  static deleteSpatialReference() {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Delete);
  }

  static saveSearchProfile(title: string, description: string) {
    cy.get('ige-result-table').find('button > span:contains("Speichern")').click(); //open up save dialogue
    cy.get('div.mat-form-field-infix >input.mat-input-element').eq(1).type(`${title}`);
    cy.get('div.mat-form-field-infix >input.mat-input-element').eq(2).type(`${description}`);
    cy.get('div.cdk-overlay-pane').find("button > span:contains('Speichern')").click();
  }

  static checkExistenceOfSavedSearch(title: string) {
    //following lines: alternative containing iterating over individual list elements
    //cy.get('mat-selection-list.mat-selection-list')
    //.find('mat-list-option.mat-list-item')
    //.each(function ($el, index, $list) {
    //console.log($el.text());

    cy.get('mat-selection-list.mat-selection-list')
      .invoke('text')
      .then(wholeText => {
        expect(wholeText).to.include(title);
      });
  }

  static deleteSavedSearch(title: string) {
    cy.contains('mat-list-option.mat-list-item', title).find('button').click();
    cy.get('div.mat-menu-content > button').click();
    cy.get('mat-dialog-actions.mat-dialog-actions > button:contains("Löschen")').click();
  }

  static SQLField = 'textarea';
}

export enum FilterExtendedSearch {
  OnlyPublished = '.mat-checkbox-inner-container > input[name="selectPublished"]',
  NoFolders = '.mat-checkbox-inner-container > input[name="exceptFolders"]',
  mCloud = '.mat-checkbox-inner-container > input[name="selectDocMCloud"]',
  Test = '.mat-checkbox-inner-container > input[name="selectDocTest"]'
}

export enum SearchOptionTabs {
  ExtendedSearch = 1,
  SQLSearch,
  SavedSearches
}

export enum contextActionSpatial {
  Edit = 1,
  Delete
}

export enum contextActionSearchResult {
  Preview = 0,
  Open,
  Export,
  Delete
}
