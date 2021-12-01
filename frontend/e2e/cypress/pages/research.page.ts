import Chainable = Cypress.Chainable;

export class ResearchPage {
  static url = '/research';

  static visit(): Chainable {
    return cy.visit('research');
  }

  static search(query: string) {
    // version without checking server request:
    return cy.get('.mat-form-field-infix > .mat-input-element').first().type(query).wait(4000);

    /*//Alternative to make sure the search term has been typed in completely
    cy.intercept('POST', '/api/search/query', req => {
      expect(req.body.term).to.equal(query);
    }).as('waitForFullSearchTerm');
    cy.get('.mat-form-field-infix > .mat-input-element')
      .type(query)
      .should(el => {
        cy.wait('@waitForFullSearchTerm');
        return el;
      });*/
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
        console.log('this: ' + $node.text().trim().split(' ')[0]);
        return parseInt($node.text().trim().split(' ')[0]);
      });
  }

  static getSearchResultCountZeroIncluded(): Chainable<number> {
    return cy
      .get('.result')
      .contains(/[0-9]+ Ergebnisse gefunden/)
      .then($node => {
        // extract number from string like '12 Ergebnisse gefunden'
        return parseInt($node.text().trim().split(' ')[0]);
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
    cy.wait('@waitForSuggestions', { timeout: 10000 });
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
    cy.contains('ige-result-table button', 'CSV').click();
  }

  static saveSearchProfile(title: string, description: string): void {
    cy.contains('.save-search-button button', 'Speichern').click();
    cy.get('[data-cy="search-name"]').type(title);
    cy.get('[data-cy="search-description"]').type(description);
    cy.intercept('POST', /api\/search/).as('saveChanges');
    cy.get('div.cdk-overlay-pane').find("button > span:contains('Speichern')").click();
    cy.wait('@saveChanges').its('response.body.name').should('eq', title);
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

  static StartDateField = 'input[formcontrolname="startDate"]';

  static EndDateField = 'input[formcontrolname="endDate"]';

  static openCalendar(point: string): void {
    point === 'von'
      ? cy.get('[aria-label="Open calendar"]').should('have.length', 2).first().click()
      : cy.get('button[aria-label="Open calendar"]').should('have.length', 2).last().click();
  }

  static pickDayOfMonth(date: number): void {
    cy.contains('.mat-calendar-body tr td', date).click();
  }

  static clearDateField(point: string): void {
    cy.get(`.mat-input-element[formcontrolname="${point}"]`).should('have.length', 1).clear({ force: true });
  }

  static setDate(point: string, date: string): Chainable {
    return cy
      .get(`.mat-input-element[formcontrolname="${point}"]`)
      .should('have.length', 1)
      .clear({ force: true })
      .type(date);
  }

  // call with recursion to avoid undeterministic behaviour
  static switchMonthsForward(date: number = 1): void {
    while (date > 0) {
      date -= 1;
      cy.log('month: ' + date.toString());
      cy.get('[aria-label="Next month"]')
        .click()
        .then(_ => {
          this.switchMonthsForward(date);
        });
    }
  }

  static switchMonthsBackward(date: number = 1): void {
    while (date > 0) {
      date -= 1;
      cy.log('month: ' + date.toString());
      cy.get('[aria-label="Previous month"]')
        .click()
        .then(_ => {
          this.switchMonthsBackward(date);
        });
    }
  }
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
