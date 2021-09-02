import Chainable = Cypress.Chainable;

export class ResearchPage {
  static url = '/research';

  static visit(): Chainable {
    return cy.visit('/research');
  }

  static search(query: string) {
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
  static chooseFirstLocationSuggestionByRadioButton(location: string): void {
    cy.intercept('/search/' + location + '*').as('waitForSuggestions');
    cy.wait('@waitForSuggestions', { timeout: 8000 });
    cy.get('mat-list.mat-list-base mat-list-item:nth-child(1)').click();
  }

  static createSpatialReference(location?: string, title?: string): void {
    cy.get('ige-facets').find('.btn-title').contains('Hinzufügen').click();
    this.addTitleAndLocationForSpatialReference(location, title);
  }

  static editSpatialReference(location = 'Deutschland', title = 'testSpatial'): void {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Edit);
    this.addTitleAndLocationForSpatialReference(location, title);
  }

  static addTitleAndLocationForSpatialReference(location = 'Deutschland', title = 'testSpatial'): void {
    if (location !== undefined) {
      cy.get('ige-spatial-dialog').find('input[data-placeholder="Suchen"]').type(location); //search term
      this.chooseFirstLocationSuggestionByRadioButton(location);
    }
    if (title !== undefined) {
      cy.get('ige-spatial-dialog').find('input[data-placeholder="Eingeben..."]').type(title); //title
    }
    cy.get('ige-spatial-dialog').find('[data-cy="confirm-dialog-save"]').click();
    //wait for the application of the filtering
    cy.intercept('/api/search/query').as('filterRequest');
    cy.wait('@filterRequest');
  }

  static interruptEditingSpatialReference(location = 'Stuttgart', title = 'testSpatial'): void {
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Edit);
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Suchen"]').type(location); //search term
    this.chooseFirstLocationSuggestionByRadioButton(location);
    cy.get('ige-spatial-dialog').find('input[data-placeholder="Eingeben..."]').type(title); //enter title
    cy.get('button').contains('Abbrechen').click();
  }

  static deleteSpatialReference(): void {
    cy.intercept('/api/search/query').as('waitForDelete');
    ResearchPage.openContextMenuSpatialReference(contextActionSpatial.Delete);
    cy.wait('@waitForDelete');
  }

  static deleteObjectFromSearchResultList(): void {
    cy.get('button').contains('Löschen').click();
    cy.intercept('DELETE', '/api/datasets/*').as('deleteRequest');
    cy.wait('@deleteRequest');
  }

  static getResultListItems(): Chainable<String[]> {
    return cy
      .get('ige-result-table')
      .find('td.mat-cell:nth-child(2)')
      .then(element => {
        let arr: String[] = [];
        element.each((index, el) => {
          arr.push(el.innerText.trim());
        });
        return arr;
      });
  }

  static getSearchResultItemsFromCSV(): Chainable<String[]> {
    let res_arr: String[] = [];
    return cy.readFile('cypress/downloads/research.csv').then(content => {
      let raw_content = content.split('\n');
      // delete string with column names
      raw_content.shift();
      // separate elements of single records
      let new_arr = raw_content.map(function (el: string) {
        return el.split(',');
      });
      // retrieve the part of the records that is relevant: the file name
      res_arr = new_arr.map(function (el: string) {
        return el[1];
      });
      //remove empty string at the end
      res_arr.pop();
      return res_arr;
    });
  }

  static downloadCSVFile(): void {
    cy.get('button.mat-button:nth-child(3) > span:nth-child(1)').click();
  }

  static saveSearchProfile(title: string, description: string): void {
    cy.get('ige-result-table').find('button > span:contains("Speichern")').click(); //open up save dialogue
    cy.get('div.mat-form-field-infix >input.mat-input-element').eq(1).type(title);
    cy.get('div.mat-form-field-infix >input.mat-input-element').eq(2).type(description);
    cy.get('div.cdk-overlay-pane').find("button > span:contains('Speichern')").click();
  }

  static getCSVFile(): void {
    cy.get('ige-result-table').find('button > span:contains("CSV")').click(); //open up save dialogue
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
