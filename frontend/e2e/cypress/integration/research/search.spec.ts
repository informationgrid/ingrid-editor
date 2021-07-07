import { BasePage } from '../../pages/base.page';
import { ResearchPage } from '../../pages/research.page';

describe('Research Page', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  //Erweiterte Suche
  xit('should do general search with without-folders-filter for documents/addresses', () => {});

  xit('should do general search with only-published-filter for documents/addresses', () => {});

  xit('should do document type search with with only-mCloud-filter', () => {});

  xit('should do document type search with with only-Test-filter', () => {});

  xit('should search for documents with spatial reference', () => {});

  xit('should start new search for documents after editing spatial reference', () => {});

  xit('should save particular search so that all the parameters are correctly saved under Gespeicherte Suchen', () => {});

  xit('should start new search for documents after deleting spatial reference', () => {});

  xit('should do search with both spatial reference and selection of filter-checkboxes included', () => {});

  xit('should open Download-Dialogue when requesting CSV-file of search', () => {});

  xit('should open respective document/address when clicking on search result', () => {});

  xit('should delete document/address via the dialogue accessible from the search result list', () => {});

  xit('should do search by using feldbezogener Suche', () => {});

  //if possible:
  xit('should make sure CSV-file of search has been downloaded', () => {});

  //SQL-Suche
  xit('should do search with example SQL-query executed by button', () => {});

  xit('should do search with example SQL-query typed in manually', () => {});

  xit('should delete SQL-query and subsequently return 0 results', () => {});

  //saved searches
  xit('should delete saved search', () => {});

  xit('should bring you back to Erweiterte Suche when saved search has been clicked', () => {});
});
