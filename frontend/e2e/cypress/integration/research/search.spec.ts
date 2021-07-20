import {
  contextActionSearchResult,
  FilterExtendedSearch,
  ResearchPage,
  SearchOptionTabs
} from '../../pages/research.page';
import { DocumentPage } from '../../pages/document.page';

describe('Research Page', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  //Erweiterte Suche
  it('should do general search with without-folders-filter for documents/addresses', () => {
    ResearchPage.visit();
    ResearchPage.search('a');
    ResearchPage.getSearchResultCount().then(allCount => {
      //wait for the filtered result in order to compare
      cy.intercept({
        method: 'POST',
        path: '/api/search/query'
      }).as('filterRequest');
      ResearchPage.checkboxSearchFilter(FilterExtendedSearch.NoFolders);
      cy.wait('@filterRequest');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should do general search with only-published-filter for documents/addresses', () => {
    ResearchPage.visit();
    ResearchPage.search('a');
    ResearchPage.getSearchResultCount().then(allCount => {
      //wait for the filtered result in order to compare
      cy.intercept({
        method: 'POST',
        path: '/api/search/query'
      }).as('filterRequest');
      ResearchPage.checkboxSearchFilter(FilterExtendedSearch.OnlyPublished);
      cy.wait('@filterRequest');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should do document type search with with only-mCloud-filter', () => {
    ResearchPage.visit();
    ResearchPage.search('a');
    ResearchPage.getSearchResultCount().then(allCount => {
      //wait for the filtered result in order to compare
      cy.intercept({
        method: 'POST',
        path: '/api/search/query'
      }).as('filterRequest');
      ResearchPage.checkboxSearchFilter(FilterExtendedSearch.mCloud);
      cy.wait('@filterRequest');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  xit('should do document type search with only-Test-filter', () => {
    ResearchPage.visit();
    ResearchPage.search('er');
    ResearchPage.getSearchResultCount().then(allCount => {
      //wait for the filtered result in order to compare
      cy.intercept({
        method: 'POST',
        path: '/api/search/query'
      }).as('filterRequest');
      ResearchPage.checkboxSearchFilter(FilterExtendedSearch.Test);
      cy.wait('@filterRequest');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  xit('should search for documents with spatial reference', () => {
    ResearchPage.visit();
    ResearchPage.search('e');
    ResearchPage.getSearchResultCount().then(allCount => {
      //wait for the filtered result in order to compare
      cy.intercept({
        method: 'POST',
        path: '/api/search/query'
      }).as('filterRequest');
      ResearchPage.createSpatialReference('Deutschland', 'testSpatial1');
      cy.wait('@filterRequest');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  xit('should start new search for documents after editing spatial reference', () => {
    ResearchPage.visit();
    ResearchPage.search('e');
    cy.intercept({
      method: 'POST',
      path: '/api/search/query'
    }).as('filterRequest');
    ResearchPage.createSpatialReference('Deutschland');
    cy.wait('@filterRequest');
    ResearchPage.getSearchResultCount().then(filteredResult => {
      cy.wait('@filterRequest');
      ResearchPage.editSpatialReference('Berlin');
      //Problem: new search result after editing is not necessarily smaller than the former result
      ResearchPage.getSearchResultCount().should('be.lessThan', filteredResult).and('be.greaterThan', 0);
    });
  });

  it('should save particular search so that all the parameters are correctly saved under Gespeicherte Suchen', () => {
    ResearchPage.visit();
    ResearchPage.search('e');
    ResearchPage.saveSearchProfile('test-50', 'save description');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.checkExistenceOfSavedSearch('test-50');
  });

  xit('should start new search for documents after deleting spatial reference', () => {
    ResearchPage.visit();
    ResearchPage.createSpatialReference('Mainz');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(spatiallyFiltered => {
      ResearchPage.deleteSpatialReference();
      ResearchPage.getSearchResultCount().should('be.greaterThan', spatiallyFiltered);
    });
  });

  xit('should do search with both spatial reference and selection of filter-checkboxes included', () => {
    ResearchPage.visit();
    ResearchPage.search('e');
    ResearchPage.checkboxSearchFilter(FilterExtendedSearch.OnlyPublished);
    ResearchPage.createSpatialReference('Deutschland');
    ResearchPage.getSearchResultCount().then(multipleFiltered => {
      ResearchPage.checkboxSearchFilter(FilterExtendedSearch.OnlyPublished);
      ResearchPage.getSearchResultCount().should('be.lessThan', multipleFiltered);
    });
  });

  //save for later
  xit('should open Download-Dialogue when requesting CSV-file of search', () => {
    cy.get('ige-result-table').find('button > span:contains("CSV")').click(); //open up CSV dialogue
  });

  it('should open respective document/address when clicking on search result', () => {
    ResearchPage.visit();
    ResearchPage.search('e');
    cy.contains('td', 'testDeleting1').click();
    cy.get('ige-header-title-row').find('span > span').should('have.text', 'testDeleting1');
  });

  it('should delete document/address via the dialogue accessible from the search result list', () => {
    DocumentPage.visit();
    DocumentPage.createDocument('testDeleting1');
    ResearchPage.visit();
    ResearchPage.search('test');
    ResearchPage.openContextMenuOfSearchResult('testDeleting1', contextActionSearchResult.Delete);
  });

  //will fail as long as "feldbezogene Suche" is not possible
  xit('should do search by using feldbezogene Suche', () => {
    ResearchPage.visit();
    ResearchPage.toggleSearchFilter('Adressen');
    ResearchPage.search('title:Testorganisation');
    ResearchPage.getSearchResultCount().should('be.greaterThan', 0);
  });

  //if possible:
  xit('should make sure CSV-file of search has been downloaded', () => {});

  //SQL-Suche
  it('should do search with example SQL-query executed by button', () => {
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.get('div.mat-chip-list-wrapper > mat-chip.mat-chip').eq(0).click(); //button "Adressen, mit Titel 'test'"
    ResearchPage.getSearchResultCount().should('be.greaterThan', 0);
  });

  it('should do search with example SQL-query typed in manually', () => {
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.get(ResearchPage.SQLField).type(
      'SELECT document1.*, document_wrapper.*\n' +
        '            FROM document_wrapper\n' +
        '                   JOIN document document1 ON\n' +
        '              CASE\n' +
        '                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id\n' +
        '                ELSE document_wrapper.draft = document1.id\n' +
        '                END\n' +
        "            WHERE document1.type = 'AddressDoc'\n" +
        "              AND LOWER(title) LIKE '%test%'"
    );
    ResearchPage.getSearchResultCount().then(manualSQLSearchResult => {
      cy.get('div.mat-chip-list-wrapper > mat-chip.mat-chip').eq(0).click();
      ResearchPage.getSearchResultCount().should('equal', manualSQLSearchResult);
    });
  });

  it('should delete SQL-query and subsequently return 0 results', () => {
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.get('div.mat-chip-list-wrapper > mat-chip.mat-chip').eq(0).click(); //button "Adressen, mit Titel 'test'"
    cy.get('button').contains('Entfernen').click();
  });

  //saved searches
  it('should delete saved search', () => {
    ResearchPage.visit();
    ResearchPage.saveSearchProfile('testSearch', 'Test search profile to be deleted afterwards');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.deleteSavedSearch('testSearch');
  });

  it('should bring you back to Erweiterte Suche when saved search has been clicked', () => {
    ResearchPage.visit();
    ResearchPage.saveSearchProfile('testProfileBackToSearch', 'Test Profile for going back to Erweiterte Suche');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    cy.contains('mat-list-option.mat-list-item', 'testProfileBackToSearch').click();
    //make sure you're in the 'Erweiterte Suche'-tab: this tab should be selected
    cy.get('div.mat-tab-labels > div.mat-ripple:nth-child(1)').invoke('attr', 'aria-selected').should('eq', 'true');
  });
});
