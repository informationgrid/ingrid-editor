import {DashboardPage} from '../../pages/dashboard.page';
import {DocumentPage, ROOT, SEPARATOR} from '../../pages/document.page';

describe('Load documents', () => {
  beforeEach(() => {
    cy.kcLogin('user');
  })

  it('should load a document from dashboard', () => {
    cy.visit(DashboardPage.url);
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.url().should('include', '/form;id=');
      cy.get(DocumentPage.title).should('have.text', text);
    });
  })

  it('should jump directly to a root folder specified by URL', () => {
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', 'Neue Testdokumente');
    cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
  })

  it('should jump directly to a nested folder specified by URL', () => {
    cy.visit('/form;id=9b264daf-3044-441d-864c-699b44c46dc1');
    cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', 'Tiefes Dokument');
    cy.get('ige-form-info ige-breadcrumb', {timeout: 3000}).shouldHaveTrimmedText(`${ROOT}${SEPARATOR} Testdokumente${SEPARATOR} Ordner 2. Ebene${SEPARATOR}`);
  })

  it('should open a document from a quick search result', () => {
    DashboardPage.visit();
    DashboardPage.search('Feature-Übersicht');
    DashboardPage.getSearchResult(1).click();
    cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
  })

  xit('should open a document from a tree search result on form page', () => {
    DocumentPage.visit();
    // DocumentPage.search('Feature-Übersicht');
    // DocumentPage.getSearchResult(1).click();
    cy.get(DocumentPage.title).should('have.text', 'Feature-Übersicht');
  })

})
