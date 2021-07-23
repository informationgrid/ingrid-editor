import Chainable = Cypress.Chainable;

export class ResearchPage {
  static url = '/research';

  static visit(): Chainable {
    return cy.visit('/research');
  }

  static search(query: string) {
    cy.intercept('POST', '/api/search/query').as('q');
    //return cy.get('.mat-form-field-infix > .mat-input-element').type(query).wait(500);
    cy.get('.mat-form-field-infix > .mat-input-element').type(query);
    cy.wait('@q');
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

  static getSearchResultCountZeroIncluded(): Chainable<number> {
    return cy
      .get('.result')
      .contains(/[0-9]+ Ergebnisse gefunden/)
      .then($node => {
        // extract number from string like '12 Ergebnisse gefunden'
        return parseInt($node.text().split(' ')[0]);
      });
  }

  static setDocumentTypeSearchFilter(docType: string): void {
    cy.get('.main-header .mat-select').click();
    cy.get('.mat-option-text').contains(docType).click();
    // wait For request to complete
    cy.intercept('**/api/search/query').as('query');
    cy.wait('@query');
  }

  static activateCheckboxSearchFilter(FilterType: FilterExtendedSearch): void {
    //without forcing cypress to click it doesn't find checkbox
    cy.get(FilterType).click({ force: true });
    cy.intercept('/api/search/query').as('filterRequest');
    cy.wait('@filterRequest');
  }

  static changeViewNumberDocuments(): void {
    cy.contains('.mat-paginator-page-size', 'Anzeige').click();
    cy.contains('.mat-select-panel-wrap span', '50').parent().click();
  }

  static openSearchOptionTab(option: SearchOptionTabs): void {
    cy.get('.mat-ripple.mat-tab-label:nth-child(' + option + ')').click();
  }

  static openContextMenuSpatialReference(action: contextActionSpatial): void {
    cy.get('div.location').find('button').click();
    cy.get('div.mat-menu-content > button:nth-child(' + action + ')').click();
  }

  static openContextMenuOfSearchResult(name: string, action: contextActionSearchResult): void {
    cy.contains('td', name).parent().find('button').click();
    cy.get('div.mat-menu-content > button').eq(action).click();
  }

  //check first radio button, only if a list with suggestions is offered
  static chooseFirstLocationSuggestionByRadioButton(): void {
    cy.get('mat-list.mat-list-base:nth-child(1)').click();
  }

  static createSpatialReference(location?: string, title?: string): void {
    cy.get('ige-facets').find('.btn-title').contains('Hinzufügen').click();
    if (location !== undefined && title !== undefined) {
      this.addTitleAndLocationForSpatialReference(location, title);
    }
    if (location === undefined && title !== undefined) {
      this.addTitleAndLocationForSpatialReference(undefined, title);
    }
    if (location !== undefined && title === undefined) {
      this.addTitleAndLocationForSpatialReference(location);
    }
    if (location === undefined && title === undefined) {
      this.addTitleAndLocationForSpatialReference();
    }
  }

  static editSpatialReference(location = 'Deutschland', title = 'testSpatial'): void {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Edit);
    if (location !== undefined && title !== undefined) {
      this.addTitleAndLocationForSpatialReference(location, title);
    }
    if (location === undefined && title !== undefined) {
      this.addTitleAndLocationForSpatialReference(undefined, title);
    }
    if (location !== undefined && title === undefined) {
      this.addTitleAndLocationForSpatialReference(location);
    }
    if (location === undefined && title === undefined) {
      this.addTitleAndLocationForSpatialReference();
    }
  }

  static addTitleAndLocationForSpatialReference(location = 'Deutschland', title = 'testSpatial'): void {
    if (location !== undefined) {
      cy.get('ige-spatial-dialog').find('input[data-placeholder="Suchen"]').type(location); //search term
      //wait for the list of suggestions to appear
      //cy.intercept('/search/*').as('waitForSuggestions');
      cy.intercept('/search/' + location + '*').as('waitForSuggestions');
      cy.wait('@waitForSuggestions');
      this.chooseFirstLocationSuggestionByRadioButton();
    }
    if (title !== undefined) {
      cy.get('ige-spatial-dialog').find('input[data-placeholder="Eingeben..."]').type(title); //title
    }
    cy.get('ige-spatial-dialog').find('[data-cy="confirm-dialog-save"]').click();
    //wait for the application of the filtering
    cy.intercept('/api/search/query').as('filterRequest');
    cy.wait('@filterRequest');
  }

  static interruptEditingSpatialReference(location = 'Deutschland', title = 'testSpatial'): void {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Edit);
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Suchen"]').type(location); //search term
    //wait for the list of suggestions to appear
    cy.intercept('/search/*').as('waitForSuggestions');
    cy.wait('@waitForSuggestions');
    this.chooseFirstLocationSuggestionByRadioButton();
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Eingeben..."]').type(title); //title
    cy.get('button').contains('Abbrechen').click();
  }

  static deleteSpatialReference(): void {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Delete);
    cy.intercept('/api/search/query').as('waitForDelete');
    cy.wait('@waitForDelete');
  }

  static saveSearchProfile(title: string, description: string): void {
    cy.get('ige-result-table').find('button > span:contains("Speichern")').click(); //open up save dialogue
    cy.get('div.mat-form-field-infix >input.mat-input-element').eq(1).type(title);
    cy.get('div.mat-form-field-infix >input.mat-input-element').eq(2).type(description);
    cy.get('div.cdk-overlay-pane').find("button > span:contains('Speichern')").click();
  }

  static chooseListItemFromSavedSearches(name: string): void {
    cy.contains('mat-list-option.mat-list-item', name).click();
    //wait for the chosen saved search to apply
    //cy.intercept('/api/search/query').as('filterRequest');
    //cy.wait('@filterRequest');
    //I chose the wait instead of intercept because intercept didn't wait for the right server request
    cy.wait(500);
  }

  static checkExistenceOfSavedSearch(title: string, description: string): void {
    cy.get('mat-selection-list.mat-selection-list').contains(title);
    cy.get('mat-selection-list.mat-selection-list').contains(description);
  }

  static deleteSavedSearch(title: string): void {
    cy.contains('mat-list-option.mat-list-item', title).find('button').click();
    cy.get('.mat-menu-content > button').contains('Löschen').click();
    cy.get('mat-dialog-actions.mat-dialog-actions > button').contains('Löschen').click();
  }

  static SQLField = '[data-cy="sql-query-field"]';
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
