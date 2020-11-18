import {DashboardPage} from '../../pages/dashboard.page';
import {DocumentPage} from '../../pages/document.page';
import {AddressPage} from '../../pages/address.page';

describe('Search', function () {

  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should show quicksearch results while entering a searchterm', () => {
    DashboardPage.search('m');
    DocumentPage.getSearchResults().its('length').then((count) => {
      DashboardPage.search('c');
      DashboardPage.search('l');
      DashboardPage.search('o');
      DashboardPage.search('u');
      DashboardPage.search('d');
      // cy.get('.cdk-overlay-pane ige-document-list-item', {timeout: 70000}).its('length').should('be.lessThan', count);
      cy.get('.cdk-overlay-pane ige-document-list-item').should('have.length.lessThan', count);

    });
    // TODO: as Unit tests and e2e tests only checks if functionality is there ("click on Alle-Link", ...)
    DashboardPage.clearSearch();
    DashboardPage.search('t');
    // result should show docs and addresses
    cy.get('.result-title').contains(/Daten \([1-9][0-9]*\)/).should('exist');
    cy.get('.result-title').contains(/Adressen \([1-9][0-9]*\)/).should('exist');

    // TODO does not work if at the end of this test. investigate!
    // result should show "All" link when more than 5 results for docs / addresses
    DashboardPage.clearSearch();
    DashboardPage.search('t');
    cy.get('a').contains('Alle').should('exist');


    // result should show only docs
    DashboardPage.clearSearch();
    DashboardPage.search('dokument');
    cy.get('.result-title').contains(/Daten \([1-9][0-9]*\)/).should('exist');
    cy.get('.result-title').contains(/Adressen \(0\)/).should('exist');
    // result should show only addresses
    DashboardPage.clearSearch();
    DashboardPage.search('adresse');
    cy.get('.result-title').contains(/Daten \(0\)/).should('exist');
    cy.get('.result-title').contains(/Adressen \([1-9][0-9]*\)/).should('exist');

  });

  it('should open a document after clicking a searchresult', () => {
    const docname = 'Feature-Übersicht';
    DashboardPage.search(docname);
    cy.get('.highlight').click();
    cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', docname);
  });

  it('should find addresses and open it', () => {
    const addressname = 'Testorganisation';
    DashboardPage.search(addressname);
    cy.get('.highlight').click();
    cy.get(AddressPage.title, {timeout: 10000}).should('have.text', addressname);
  });

  it('should find folders and open it', () => {
    const foldername = 'Neue Testdokumente';
    DashboardPage.search(foldername);
    cy.get('.highlight').click();
    cy.get(AddressPage.title, {timeout: 10000}).should('have.text', foldername);
  });

  it('should switch to research page after click "Erweiterte Suche" and show all documents/addresses', () => {
    DashboardPage.search('t');
    cy.get('a').contains('Erweiterte Suche').click();
    cy.get('div').contains('Die Suchergebnisseite ist gerade in der Entwicklung.');
    // cy.url().should('include', '/research');
  });

  xit('should switch to research page and filter by all documents/addresses', () => {
  });
});
