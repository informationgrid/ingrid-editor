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
    cy.visit('research');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  //Erweiterte Suche
  it('should do general search with without-folders-filter for documents/addresses', () => {
    ResearchPage.search(' ');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.NoFolders);
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should do general search with only-published-filter for documents/addresses', () => {
    ResearchPage.search(' ');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should filter search to show only documents with mCLOUD document type', () => {
    ResearchPage.search(' ');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.mCloud);
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should filter search to show only documents with Test document type', () => {
    ResearchPage.search('er');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.Test);
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should search for documents with spatial reference', () => {
    ResearchPage.search(' ');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.createSpatialReference('Deutschland', 'testSpatial1');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should start new search for documents after editing spatial reference', () => {
    ResearchPage.search(' ');
    ResearchPage.createSpatialReference('Deutschland');
    ResearchPage.getSearchResultCount().then(filteredResult => {
      ResearchPage.editSpatialReference('Mainz');
      ResearchPage.getSearchResultCount().should('be.lessThan', filteredResult).and('be.greaterThan', 0);
    });
  });

  it('should save particular search so that all the parameters are correctly saved under Gespeicherte Suchen', () => {
    ResearchPage.search(' ');
    ResearchPage.saveSearchProfile('savedProfileForTesting', 'save description to test existence later');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.checkExistenceOfSavedSearch('savedProfileForTesting', 'save description to test existence later');
  });

  it('should start new search for documents after deleting spatial reference', () => {
    ResearchPage.createSpatialReference('Deutschland');
    ResearchPage.getSearchResultCount().then(spatiallyFiltered => {
      ResearchPage.deleteSpatialReference();
      ResearchPage.getSearchResultCount().should('be.greaterThan', spatiallyFiltered);
    });
  });

  it('should do search with both spatial reference and selection of filter-checkboxes included', () => {
    ResearchPage.search(' ');
    ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
    ResearchPage.createSpatialReference('Deutschland');
    ResearchPage.getSearchResultCount().then(multipleFiltered => {
      ResearchPage.visit();
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
      ResearchPage.getSearchResultCount().should('be.greaterThan', multipleFiltered);
    });
  });

  it('should open respective document/address when clicking on search result', () => {
    ResearchPage.search('Test');
    ResearchPage.changeViewNumberDocuments();
    cy.contains('td', 'Test mCLOUD Dokument').click();
    cy.get('ige-header-title-row').find('span > span').should('have.text', 'Test mCLOUD Dokument');
  });

  it('should delete document/address via the dialogue accessible from the search result list', () => {
    DocumentPage.visit();
    DocumentPage.createDocument('testToDeleteFromResearchPage');
    ResearchPage.visit();
    ResearchPage.search('test');
    ResearchPage.changeViewNumberDocuments();
    ResearchPage.openContextMenuOfSearchResult('testToDeleteFromResearchPage', contextActionSearchResult.Delete);
    cy.get('button').contains('Löschen').click();
    ResearchPage.visit();
    ResearchPage.search('test');
    ResearchPage.changeViewNumberDocuments();
    cy.contains('td', 'testToDeleteFromResearchPage').should('not.exist');
  });

  // #3403
  xit('should do search by using feldbezogene Suche', () => {
    ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.search('title:Testorganisation');
    ResearchPage.getSearchResultCount().should('be.greaterThan', 0);
  });

  // #3432
  xit('should do search by using document ID', () => {
    ResearchPage.search('98b74a0e-0473-4a73-b0ff-c7764c8a25db');
    cy.contains('td', 'TestDocResearch1');
    ResearchPage.getSearchResultCount().should('be.greaterThan', 0);
  });

  it('should make sure CSV-file of search has been downloaded', () => {
    ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.NoFolders);
    cy.intercept('153-es2015.87cc53934ab68e612d9e.js').as('csvRequest');
    ResearchPage.getCSVFile();
    cy.wait('@csvRequest')
      .its('request')
      .then(req => {
        cy.request(req).then(({ body, headers, status }) => {
          expect(headers).to.have.property('content-type', 'application/javascript');
          expect(status).to.eq(200);
        });
      });
  });

  //SQL-Suche
  it('should do search with example SQL-query executed by button', () => {
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    ResearchPage.getSearchResultCount().should('be.greaterThan', 0);
  });

  it('should do search with example SQL-query typed in manually', () => {
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
    cy.get('button').contains('Suchen').click();
    cy.intercept('/api/search/querySql').as('query');
    cy.wait('@query');
    ResearchPage.getSearchResultCount().then(manualSQLSearchResult => {
      cy.get('div.mat-chip-list-wrapper > mat-chip.mat-chip').eq(0).click();
      ResearchPage.getSearchResultCount().should('equal', manualSQLSearchResult);
    });
  });

  it('should delete SQL-query and subsequently return 0 results', () => {
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    cy.get('button').contains('Entfernen').click();
    ResearchPage.getSearchResultCountZeroIncluded().should('be.equal', 0);
  });

  //saved searches
  it('should delete saved search', () => {
    ResearchPage.saveSearchProfile('testForSavedSearch', 'Test search profile to be deleted afterwards');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.deleteSavedSearch('testForSavedSearch');
    cy.contains('mat-list-option.mat-list-item', 'testForSavedSearch').should('not.exist');
  });

  it('should bring you back to Erweiterte Suche when saved search has been clicked', () => {
    ResearchPage.saveSearchProfile('testProfileBackToSearch', 'Test Profile for going back to Erweiterte Suche');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.chooseListItemFromSavedSearches('testProfileBackToSearch');
    //make sure you're in the 'Erweiterte Suche'-tab: this tab should be selected
    cy.contains('.mat-tab-label-content', 'Erweiterte Suche')
      .parent()
      .invoke('attr', 'aria-selected')
      .should('eq', 'true');
  });

  it('should verify that clicking on saved search executes search according to search profile', () => {
    ResearchPage.search('and');
    ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.NoFolders);
    ResearchPage.saveSearchProfile('verifySearchingBehaviour', 'saved profile to check if searching is correct');
    ResearchPage.getSearchResultCount().then(filteredResult => {
      ResearchPage.visit();
      // compare filtered result with all results
      ResearchPage.getSearchResultCount().should('be.greaterThan', filteredResult);
      ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
      ResearchPage.chooseListItemFromSavedSearches('verifySearchingBehaviour');
      // compare filtered result retrieved via choosing from list of saved searches with the original filtered result
      ResearchPage.getSearchResultCount().should('be.equal', filteredResult);
    });
  });

  it('should return to state of originally saved search when editing search is discontinued', () => {
    ResearchPage.createSpatialReference('Hamburg', 'search to interrupt editing');
    ResearchPage.interruptEditingSpatialReference('Berlin');
    cy.get('div.location').contains('Hamburg');
  });

  // test for naughty strings
  xit('should be able to deal with search term "\'" and "{"', () => {
    DocumentPage.visit();
    DocumentPage.createDocument("What's{This");
    ResearchPage.visit();
    ResearchPage.search("What's{");
    ResearchPage.changeViewNumberDocuments();
    // make sure there's an exact match (-> no substring match)
    cy.contains('td', "What's{This").should('have.text', " What's{This ");
    ResearchPage.getSearchResultCountZeroIncluded().should('eq', 1);
  });
});
