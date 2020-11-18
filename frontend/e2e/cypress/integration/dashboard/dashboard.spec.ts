import {DashboardPage} from '../../pages/dashboard.page';
import {DocumentPage} from '../../pages/document.page';
import {Utils} from '../../pages/utils';
import {Address, AddressPage} from '../../pages/address.page';

describe('Dashboard', () => {

  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should be shown as initial page when visiting app', () => {
    cy.get('.welcome').should('contain.text', 'Guten Morgen');
    cy.url().should('include', '/dashboard');
  });

  xit('should show correct number of published and draft documents in chart', function () {

  });

  it('should load a document from dashboard from latest docs box', () => {
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.url().should('include', '/form;id=');
      cy.get(DocumentPage.title).should('have.text', text);
    });
  });

  describe('Search', () => {

    it('should open a document from a quick search result', () => {
      DashboardPage.search('Feature-Übersicht');
      DashboardPage.getSearchResult(1).click();
      cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
    });

    it('should show empty search input field when clicking on x-button', function () {
      const searchterm = 'whatever';
      DashboardPage.search(searchterm);
      cy.get('ige-quick-search').get('input').should('have.value', searchterm);
      DashboardPage.clearSearch();
      cy.get('ige-quick-search').get('input').should('have.value', '');
    });
  });

  describe('Action Buttons', () => {
    it('should create a new folder', () => {
      cy.get('.shortcut').contains('Neuer Ordner').click();

      const folderName = 'Test Ordner aus dashboard button' + Utils.randomString();
      cy.get('[data-cy=create-title]').type(folderName);
      cy.get('[data-cy=create-action]').click();

      cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', folderName);
    });

    it('should create a new document', () => {
      cy.get('.shortcut').contains('Neuer Datensatz').click();

      const dataName = 'Test Datensatz aus dashboard button' + Utils.randomString();
      cy.get('[data-cy=create-title]').type(dataName);
      cy.get('[data-cy=create-action]').click();

      cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', dataName);

    });

    it('should create a new address', () => {
      cy.get('.shortcut').contains('Neue Adresse').click();

      const instuteName = 'Test Adresse aus dashboard button ' + Utils.randomString();
      AddressPage.CreateDialog.fill(new Address('', '', instuteName));
      cy.get('[data-cy=create-action]').click();

      cy.get(AddressPage.title, {timeout: 10000}).should('have.text', instuteName);
    });
  });
});
