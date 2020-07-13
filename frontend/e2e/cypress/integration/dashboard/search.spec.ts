import {DashboardPage} from "../../pages/dashboard.page";
import {DocumentPage} from "../../pages/document.page";

describe('Search', function () {

  before(function () {
    cy.kcLogin('user');
    cy.visit('');
  });

  xit.only('should show quicksearch results while entering a searchterm', () => {
    DashboardPage.search('t');
    DocumentPage.getSearchResults().should('have.length', 8);
    DashboardPage.search('e');
    DashboardPage.search('s');
    DashboardPage.search('t');
    DocumentPage.getSearchResults().should('have.length', 5);
    // TODO: as Unit tests and e2e tests only checks if functionality is there ("click on Alle-Link", ...)
    // result should show docs and addresses
    // result should show only docs
    // result should show only addresses
    // result should show "All" link when more than 5 results for docs / addresses

  });

  xit('should open a document after clicking a searchresult', () => {
  });

  xit('should find addresses and open it', () => {
  });

  xit('should find folders and open it', () => {
  });

  xit('should switch to research page after click "Erweiterte Suche" and show all documents/addresses', () => {
  });

  xit('should switch to research page and filter by all documents/addresses', () => {
  });
});
