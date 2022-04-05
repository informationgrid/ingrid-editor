import { DashboardPage } from '../../pages/dashboard.page';
import { ResearchPage } from '../../pages/research.page';
import { DocumentPage } from '../../pages/document.page';
import { AddressPage } from '../../pages/address.page';

describe('Search', function () {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin');
    cy.visit('');
  });

  it('should show quicksearch results while entering a searchterm', () => {
    // check and compare number of search result suggestions when typing in search term
    DashboardPage.search('m');
    DocumentPage.getSearchResults()
      .its('length')
      .then(count => {
        DashboardPage.search('cloud');
        cy.get('.cdk-overlay-pane ige-document-list-item').should('exist');
        cy.get('.cdk-overlay-pane ige-document-list-item').should('have.length.lessThan', count);
      });

    // search results should contain both docs and addresses
    DashboardPage.clearSearch();
    DashboardPage.search('t');
    cy.get('.result-title')
      .contains(/Daten \([1-9][0-9]*\)/)
      .should('exist');
    cy.get('.result-title')
      .contains(/Adressen \([1-9][0-9]*\)/)
      .should('exist');

    // result should show only docs
    DashboardPage.clearSearch();
    DashboardPage.search('dokument');
    cy.get('.result-title')
      .contains(/Daten \([1-9][0-9]*\)/)
      .should('exist');
    cy.get('.result-title')
      .contains(/Adressen \(0\)/)
      .should('exist');

    // result should show only addresses
    DashboardPage.clearSearch();
    DashboardPage.search('adresse');
    cy.get('.result-title')
      .contains(/Daten \(0\)/)
      .should('exist');
    cy.get('.result-title')
      .contains(/Adressen \([1-9][0-9]*\)/)
      .should('exist');

    // result should show "Alle" link when more than 5 results for docs and addresses
    DashboardPage.clearSearch();
    DashboardPage.search('a');
    cy.get('a[data-cy*="all-link-"]').should('have.length', 2);
  });

  it('should open a document after clicking a searchresult', () => {
    const docName = 'TestDocResearch3';
    DashboardPage.search(docName);
    cy.get('.highlight').click();
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', docName);
  });

  it('should find addresses and open it', () => {
    const addressName = 'Testorganisation';
    DashboardPage.search(addressName);
    cy.get('.highlight').click();
    cy.get(AddressPage.title, { timeout: 10000 }).should('have.text', addressName);
  });

  it('should find folders and open it', () => {
    const folderName = 'Neue Testdokumente';
    DashboardPage.search(folderName);
    cy.get('.highlight').click();
    cy.get(AddressPage.title, { timeout: 10000 }).should('have.text', folderName);
  });

  it('should switch to research page after click "Erweiterte Suche" and show all documents/addresses', () => {
    DashboardPage.search('t');
    cy.get('a').contains('Erweiterte Suche').click();
    cy.url().should('include', '/research');
    // check result table for at least 5 hits
    cy.get('.mat-row').should('have.length.at.least', 5);
  });

  it('should switch to research page and filter by all documents', () => {
    // get all number of 'Dokumente'
    ResearchPage.visit();
    ResearchPage.getSearchResultCount().then(allCount => {
      // go back to Dashboard to start non-empty search
      DashboardPage.visit();
      // must have more than 5 results for the 'Alle' Button to show up
      DashboardPage.search('te');
      cy.get('[data-cy=all-link-data]').click();

      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });

  it('should switch to research page and filter by all addresses', () => {
    // get number off 'Adressen'
    ResearchPage.visit();
    ResearchPage.setDocumentTypeSearchFilter('Adressen');

    ResearchPage.getSearchResultCount().then(allCount => {
      // go back to Dashboard to start non-empty search
      DashboardPage.visit();
      // must have more than 5 results for the 'Alle' Button to show up
      DashboardPage.search('te');
      cy.get('[data-cy=all-link-address]').click();

      ResearchPage.getSearchResultCount().should('be.lessThan', allCount).and('be.greaterThan', 0);
    });
  });
});
