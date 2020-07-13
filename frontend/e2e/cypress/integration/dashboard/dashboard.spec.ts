import {DashboardPage} from "../../pages/dashboard.page";
import {DocumentPage} from "../../pages/document.page";

describe('Dashboard', () => {

  before(() => {
    cy.kcLogin('user');
    cy.visit('');
  });

  it('should be shown as initial page when visiting app', () => {
    cy.get('.welcome').should('contain.text', 'Guten Morgen');
    cy.url().should('include', '/dashboard');
  });

  xit('should show correct number of published and draft documents in chart', function () {

  });

  it('should load a document from dashboard from latest docs box', () => {
    cy.visit(DashboardPage.url);
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.url().should('include', '/form;id=');
      cy.get(DocumentPage.title).should('have.text', text);
    });
  });

  describe('Search', () => {

    it('should open a document from a quick search result', () => {
      DashboardPage.visit();
      DashboardPage.search('Feature-Übersicht');
      DashboardPage.getSearchResult(1).click();
      cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
    })

    xit('should show emty search input field when clicking on x-button', function () {

    });
  });

  describe('Action Buttons', () => {
    xit('should create a new folder', () => {

    });

    xit('should create a new document', () => {

    });

    xit('should create a new address', () => {

    });
  });
});
