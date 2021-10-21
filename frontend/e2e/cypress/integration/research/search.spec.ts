import {
  contextActionSearchResult,
  FilterExtendedSearch,
  ResearchPage,
  SearchOptionTabs
} from '../../pages/research.page';
import { DocumentPage } from '../../pages/document.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { AddressPage } from '../../pages/address.page';

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
    ResearchPage.deleteObjectFromSearchResultList();
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
  it('should do search by using document ID', () => {
    ResearchPage.search('98b74a0e-0473-4a73-b0ff-c7764c8a25db');
    cy.contains('td', 'TestDocResearch1');
    ResearchPage.getSearchResultCount().should('equal', 1);
  });

  it('should make sure CSV-file of search has been downloaded', () => {
    ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
    cy.intercept('GET', /192.168.0.[0-9]{3}\/.+\.js$/).as('csvRequest');
    ResearchPage.getCSVFile();
    cy.wait('@csvRequest');
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.readFile(downloadsFolder + '/research.csv', { timeout: 10000 }).should('exist');
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
    // make sure query field is not empty
    cy.get('[data-cy="sql-query-field"]').should('not.have.value', '');
    // make sure a non-zero number of results is returned
    cy.contains(/[1-9][0-9]* Ergebnisse gefunden/);
    // click the button to remove query
    cy.get('button').contains('Entfernen').click();
    // make sure query has been removed from query field
    cy.get('[data-cy="sql-query-field"]').should('have.value', '');
    //ResearchPage.getSearchResultCountZeroIncluded().should('be.equal', 0);  <- not very stable,
    // with the following easier solution the whole assertion is retried until it resolves to true (within the timeout
    // interval of course) which makes it much more robust:
    cy.contains('.result', '0 Ergebnisse gefunden');
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

  it('should do search via Schnellsuche by using document ID', () => {
    // Schnellsuche in Dashboard:
    DashboardPage.visit();
    DashboardPage.search('98b74a0e-0473-4a73-b0ff-c7764c8a25db');
    cy.contains('button', 'Suchen').click();
    cy.contains('td', 'TestDocResearch1');
    ResearchPage.getSearchResultCount().should('equal', 1);

    DashboardPage.visit();
    DashboardPage.search('556c875e-d471-4a35-8203-0c750737d296');
    cy.contains('button', 'Suchen').click();
    ResearchPage.setDocumentTypeSearchFilter('Adressen');
    cy.contains('td', 'Taunus, Adresse');
    ResearchPage.getSearchResultCount().should('equal', 1);

    // Schnellsuche in Address Page:
    AddressPage.visit();
    AddressPage.search('556c875e-d471-4a35-8203-0c750737d296');
    cy.contains('mat-option .doc-item', 'Taunus').click();
    cy.contains('.title', 'Taunus');

    // Schnellsuche in Document Page:
    DocumentPage.visit();
    DocumentPage.search('98b74a0e-0473-4a73-b0ff-c7764c8a25db');
    cy.contains('mat-option .doc-item', 'TestDocResearch1').click();
    cy.contains('.title', 'TestDocResearch');
  });

  // test for naughty strings
  xit('should be able to deal with potentially problematic search terms (#3457)', () => {
    //check if document with problematic strings in title can be found
    DocumentPage.visit();
    DocumentPage.createDocument("What's{This");
    ResearchPage.visit();
    ResearchPage.search("What's{");
    cy.get('.error').should('not.exist');
    ResearchPage.changeViewNumberDocuments();
    // make sure there's an exact match (-> no substring match)
    cy.contains('td', "What's{This").should('have.text', " What's{This ");
    ResearchPage.getSearchResultCountZeroIncluded().should('eq', 1);

    //check if search accepts potentially problematic strings
    ResearchPage.search(',./;\'[]\\-=\n <>?:"{}|_+\n!@#$%^&*()`~');
    cy.get('.error').should('not.exist');

    ResearchPage.search('1.00$1.001/21E21E02');
    cy.get('.error').should('not.exist');

    ResearchPage.search('Ω≈ç√∫˜µ≤≥÷åß∂ƒ©˙∆˚¬…æœ∑´®†¥¨ˆøπ“‘¡™£¢∞§¶•ªº–≠');
    cy.get('.error').should('not.exist');

    ResearchPage.search('ÅÍÎÏ˝ÓÔÒÚÆ☃Œ„´‰ˇÁ¨ˆØ∏”’`⁄€‹›ﬁﬂ‡°·‚—±⅛⅜⅝⅞');
    cy.get('.error').should('not.exist');

    ResearchPage.search('ЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя');
    cy.get('.error').should('not.exist');

    ResearchPage.search('田中さんにあげて下さいパーティーへ行かないか');
    cy.get('.error').should('not.exist');

    ResearchPage.search('和製漢語部落格𠜎𠜱𠝹𠱓𠱸𠲖𠳏');
    cy.get('.error').should('not.exist');

    ResearchPage.search('사회과학원 어학연구소찦차를 타고 온 펲시맨과 쑛다리 똠방각하');
    cy.get('.error').should('not.exist');

    ResearchPage.search('社會科學院語學研究所울란바토르\n');
    cy.get('.error').should('not.exist');
  });

  it('should verify content of downloaded CSV file', () => {
    ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
    ResearchPage.changeViewNumberDocuments();
    ResearchPage.downloadCSVFile();
    ResearchPage.getResultListItems().then(arr1 => {
      ResearchPage.getSearchResultItemsFromCSV().then(arr2 => {
        // compare the content of the two arrays
        //assert(arr2.length === arr1.length && arr2.every((value, index) => value === arr1[index]));
        expect(arr2).to.deep.eq(arr1);
      });
    });
  });
});
