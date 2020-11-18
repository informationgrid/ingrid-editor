import {DocumentPage, ROOT, SEPARATOR} from '../../pages/document.page';
import {beforeEach} from 'mocha';

describe('Load documents', () => {

  beforeEach(() => {
    cy.kcLogin('user');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  // tested in dashboard
  // it('should load a document from dashboard', () => {

  it('should show a dashboard view when no document is selected or in root element', function () {
    DocumentPage.visit();
    cy.get('ige-form-dashboard').should('contain', 'Daten').should('contain', 'Neuer Datensatz');
    // expect(cy.get('ige-form-dashboard')).to.contain('text');
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get('ige-form-info ige-breadcrumb .selectable').click();
    cy.get('ige-form-dashboard').should('contain', 'Daten').should('contain', 'Neuer Datensatz');
  });

  it('should jump directly to a root folder specified by URL', () => {
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', 'Neue Testdokumente');
    cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
  });

  it('should jump directly to a nested folder specified by URL', () => {
    cy.visit('/form;id=9b264daf-3044-441d-864c-699b44c46dc1');
    cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', 'Tiefes Dokument');
    // this function waits for text to appear, but shouldHaveTrimmedText not!
    cy.get('ige-form-info ige-breadcrumb')
      .should('have.text', `${ROOT}${SEPARATOR}Testdokumente${SEPARATOR}Ordner 2. Ebene`);
  });

  // tested in dashboard
  // it('should open a document from a quick search result', () => {

  it('should open a document from a tree search result on form page', () => {
    DocumentPage.visit();
    DocumentPage.search('Feature-Übersicht');
    DocumentPage.getSearchResult().click();
    cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
  });

  it('should open the previously selected document when going to another page and returning', function () {
    DocumentPage.visitSingleDoc();
    cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
    cy.get(DocumentPage.Sidemenu.Uebersicht).click();
    cy.get(DocumentPage.Sidemenu.Adressen).click();
    cy.get(DocumentPage.Sidemenu.Daten).click();
    cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
  });
})
