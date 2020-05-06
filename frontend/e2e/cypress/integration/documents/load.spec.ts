import {DashboardPage} from '../../pages/dashboard.page';
import {DocumentPage} from '../../pages/document.page';

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

  it('should jump directly to a document specified by URL', () => {
    cy.visit('/form;id=da0f1be6-ef4c-4ab3-8d06-7165eca1eb05');
    cy.get(DocumentPage.title, {timeout: 10000}).should('have.text', 'sub zzz');
  })

  it('should open a document from a quick search result', () => {
    DashboardPage.visit();
    DashboardPage.search('sub zzz');
    DashboardPage.getSearchResult(1).click();
    cy.get(DocumentPage.title).should('have.text', 'sub zzz');
  })

})
