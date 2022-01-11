import {
  contextActionSearchResult,
  FilterExtendedSearch,
  ResearchPage,
  SearchOptionTabs
} from '../../pages/research.page';
import { DocumentPage } from '../../pages/document.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { AddressPage } from '../../pages/address.page';
import { Menu } from '../../pages/menu';

describe('Research Page', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user').as('tokens');
    ResearchPage.visit();
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
      //ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
      ResearchPage.getSearchResultCount().should(res => {
        expect(res).to.be.lessThan(allCount).and.to.be.greaterThan(0);
      });
    });
  });

  it('should filter search to show only documents with mCLOUD document type', () => {
    ResearchPage.search(' ');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.mCloud);
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  // Test document type does not exist in mCLOUD-profile anymore and does not need to be tested
  xit('should filter search to show only documents with Test document type', () => {
    ResearchPage.search('er');
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.Test);
      // since there are no Test documents in this catalog, expect result to be 0
      ResearchPage.checkNoSearchResults();
    });
  });

  it('should search for documents with spatial reference', () => {
    /*ResearchPage.search(' ');*/
    ResearchPage.getSearchResultCount().then(allCount => {
      ResearchPage.createSpatialReference('Deutschland', 'testSpatial1');
      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should start new search for documents after editing spatial reference', () => {
    //    ResearchPage.search(' ');
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
    ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
    ResearchPage.getSearchResultCount().then(multipleFiltered => {
      ResearchPage.createSpatialReference('Deutschland');
      ResearchPage.getSearchResultCount().should('be.lessThan', multipleFiltered);
    });
  });

  it('should open respective document/address when clicking on search result', () => {
    ResearchPage.search('Test mCLOUD');
    ResearchPage.changeViewNumberDocuments();
    ResearchPage.openDocumentFromResultList('Test mCLOUD Dokument');
    cy.get('.title').should('contain', 'Test mCLOUD Dokument');
  });

  it('should delete a document from search result list', () => {
    DocumentPage.CreateFullMcloudDocumentWithAPI('testToDeleteFromResearchPage');
    ResearchPage.search('testToDeleteFromResearchPage');
    ResearchPage.openContextMenuOfSearchResult('testToDeleteFromResearchPage', contextActionSearchResult.Delete);
    ResearchPage.deleteObjectFromSearchResultList();
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
    // make sure file is completely downloaded
    cy.wait(1000);
    cy.readFile(downloadsFolder + '/research.csv', { timeout: 10000 }).should('exist');
  });

  //SQL-Suche
  it('should do search with example SQL-query executed by button', () => {
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    // because of changes in the database the search does not return anything at the moment
    ResearchPage.checkNoSearchResults();
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
    ResearchPage.getSearchResultCountZeroIncluded().then(manualSQLSearchResult => {
      cy.get('div.mat-chip-list-wrapper > mat-chip.mat-chip').eq(0).click();
      ResearchPage.getSearchResultCountZeroIncluded().should('equal', manualSQLSearchResult);
    });
  });

  it('should delete SQL-query and subsequently return 0 results', () => {
    cy.intercept('/api/search/querySql').as('sqlQuery');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    // make sure query field is not empty
    cy.get('[data-cy="sql-query-field"]').should('not.have.value', '');
    // make sure a non-zero number of results is returned
    cy.wait('@sqlQuery');
    // because of changes in the database the search does not return anything at the moment
    //cy.contains(/[1-9][0-9]* Ergebnisse gefunden/);
    ResearchPage.checkNoSearchResults();
    // click the button to remove query
    cy.get('button').contains('Entfernen').click();
    // make sure query has been removed from query field and 0 results are returned
    cy.get('[data-cy="sql-query-field"]').should('have.value', '');
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
    cy.get('div.location').contains('search to interrupt editing');
  });

  it('should be able to create different types of saved searches', () => {
    // create saved search with limited viewer scope
    ResearchPage.createSpatialReference('Hamburg', 'saved search with small scope');
    ResearchPage.saveSearchProfile('savedSearchProfileLimitedScope', 'save description to test existence and scope');
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.checkExistenceOfSavedSearch(
      'savedSearchProfileLimitedScope',
      'save description to test existence and scope'
    );
    // check for correct search parameters
    ResearchPage.openSavedSearch('savedSearchProfileLimitedScope', 'save description to test existence and scope');
    cy.get('.location').should('not.be.empty');
    // create globally visible search
    ResearchPage.visit();
    ResearchPage.search('das');
    ResearchPage.saveSearchProfile(
      'savedSearchProfileExtendedScope',
      'save description to test existence and extended scope',
      true
    );
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.checkExistenceOfSavedSearch(
      'savedSearchProfileExtendedScope',
      'save description to test existence and extended scope'
    );
    // log in as different user and trigger saved search
    cy.kcLogout();
    cy.kcLogin('meta');
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.openSavedSearch(
      'savedSearchProfileExtendedScope',
      'save description to test existence and extended scope',
      'Globale Suchanfragen'
    );
    cy.get('input.mat-input-element').first().should('have.value', 'das');
    // todo: check that global search can not be deleted
  });

  it('should do search via Schnellsuche by using document ID', () => {
    // Schnellsuche in Dashboard:
    DashboardPage.visit();
    DashboardPage.search('98b74a0e-0473-4a73-b0ff-c7764c8a25db');
    cy.contains('button', 'Suchen').click();
    ResearchPage.checkDocumentInSearchResults('TestDocResearch1');
    ResearchPage.getSearchResultCount().should('equal', 1);

    DashboardPage.visit();
    DashboardPage.search('556c875e-d471-4a35-8203-0c750737d296');
    cy.contains('button', 'Suchen').click();
    ResearchPage.checkNoSearchResults();
    ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.checkDocumentInSearchResults('Taunus, Adresse');
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

  // test for nasty strings
  it('should be able to deal with potentially problematic search terms (#3457)', () => {
    //check if document with problematic strings in title can be found
    DocumentPage.visit();
    DocumentPage.createDocument("What's{This");
    ResearchPage.visit();
    ResearchPage.search("What's{");
    cy.get('.error').should('not.exist');
    ResearchPage.changeViewNumberDocuments();
    // make sure there's an exact match (-> no substring match)
    cy.contains('td', "What's{This").should('have.text', " What's{This ");
    ResearchPage.getSearchResultCount().should('equal', 1);

    //check if search accepts potFentially problematic strings
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

  it('should do timerelated search with only start date given (#3040)', () => {
    // choose start date and compare filtered results with number of all search results
    ResearchPage.setDate('startDate', '09.08.2021');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.clearDateField('startDate');
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.greaterThan', temporallyFiltered);
    });
  });

  it('should do timerelated search with only end date given (#3040)', () => {
    // choose end date and compare filtered results with number of all search results
    ResearchPage.setDate('endDate', '11.08.2021');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.clearDateField('endDate');
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.greaterThan', temporallyFiltered);
    });
  });

  it('should do timerelated search with both start date and end date given (#3040)', () => {
    // choose start date and compare filtered results with number of all search results
    ResearchPage.setDate('startDate', '07.08.2021');
    ResearchPage.setDate('endDate', '29.08.2021');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.clearDateField('endDate');
      ResearchPage.clearDateField('startDate');
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.greaterThan', temporallyFiltered);
    });
  });

  it('timerelated search with same start date and end date should return only documents belonging to this date (#3040)', () => {
    ResearchPage.setDate('startDate', '22.07.2021');
    ResearchPage.setDate('endDate', '22.07.2021');
    cy.wait(500);

    // iterate through every result to check date
    cy.get('tbody tr').each(el => {
      cy.wrap(el).should('contain', '22.07.2021');
    });

    // compare filtered results with number of all search results
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.clearDateField('endDate');
      ResearchPage.clearDateField('startDate');
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.greaterThan', temporallyFiltered);
    });
  });

  it('timerelated search with start date more recent than end date should return 0 results (#3040)', () => {
    ResearchPage.setDate('startDate', '24.07.2021');
    ResearchPage.setDate('endDate', '22.07.2021');
    cy.wait(500);
    ResearchPage.checkNoSearchResults();
  });

  it('timerelated search for specific document should only return it when respective date is covered by interval (#3040)', () => {
    // date interval too early for specific document
    ResearchPage.setDate('startDate', '20.06.2021');
    ResearchPage.setDate('endDate', '29.06.2021');
    cy.wait(500);
    // expect to get 0 results
    ResearchPage.checkNoSearchResults();
    // stretch the interval to cover the date in question
    ResearchPage.setDate('endDate', '30.06.2021');
    cy.wait(500);
    // expect the document to be returned
    ResearchPage.getSearchResultCount().should('equal', 1);
    cy.contains('tbody tr', 'Veröffentlichter Datensatz mit Bearbeitungsversion');
  });

  it('should do timerelated search together with search for published documents (#3040)', () => {
    ResearchPage.setDate('startDate', '20.06.2021');
    ResearchPage.setDate('endDate', '29.07.2021');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.OnlyPublished);
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.lessThan', temporallyFiltered);
    });
  });

  it('should do timerelated search together with document type search (#3040)', () => {
    ResearchPage.setDate('startDate', '10.05.2021');
    ResearchPage.setDate('endDate', '30.08.2021');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.activateCheckboxSearchFilter(FilterExtendedSearch.mCloud);
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.lessThan', temporallyFiltered);
    });
  });

  it('should do timerelated search together with spatial reference search (#3040)', () => {
    ResearchPage.setDate('startDate', '20.06.2021');
    ResearchPage.setDate('endDate', '29.07.2021');
    cy.wait(500);
    ResearchPage.getSearchResultCount().then(temporallyFiltered => {
      ResearchPage.createSpatialReference('Deutschland', 'testSpatial10');
      cy.wait(500);
      ResearchPage.getSearchResultCount().should('be.lessThan', temporallyFiltered);
    });
  });

  it('should be possible to delete date from input fields (#3040)', () => {
    // type in dates
    ResearchPage.setDate('startDate', '20.06.2021');
    ResearchPage.setDate('endDate', '29.07.2021');
    // delete dates
    cy.get(ResearchPage.StartDateField).clear();
    cy.get(ResearchPage.EndDateField).clear();
    // make sure input fields for the date are empty
    cy.get(ResearchPage.StartDateField).invoke('val').should('be.empty');
    cy.get(ResearchPage.EndDateField).invoke('val').should('be.empty');
    // continue with navigating the site and make sure date field stays cleared
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SavedSearches);
    ResearchPage.openSearchOptionTab(SearchOptionTabs.ExtendedSearch);
    cy.get(ResearchPage.StartDateField).invoke('val').should('be.empty');
    cy.get(ResearchPage.EndDateField).invoke('val').should('be.empty');
  });
});
