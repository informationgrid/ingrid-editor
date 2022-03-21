import { DocumentPage } from '../../pages/document.page';
import { Tree } from '../../pages/tree.partial';
import { ResearchPage } from '../../pages/research.page';
import { CopyCutUtils } from '../../pages/copy-cut-utils';

describe('performance tests for large amounts of data', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('ige4').as('tokens');
  });

  it('navigate to a nested folder', () => {
    DocumentPage.visit();
    Tree.openNode(['Viele Datensätze', 'Ordner_B', 'Ordner_1', 'Dataset - lux']);
    cy.contains('.title', 'Dataset - lux');
  });

  it('search for data', () => {
    ResearchPage.visit();
    ResearchPage.search('Dataset - 4im');
    ResearchPage.getSearchResultCount().should('equal', 10);
  });

  it('copy some data', () => {
    DocumentPage.visit();
    Tree.openNode(['Viele Datensätze', 'Ordner_I', 'Ordner_8']);
    CopyCutUtils.copyObjectWithTree(['Viele Datensätze', 'Ordner_J']);
  });

  it('move some data', () => {
    DocumentPage.visit();
    Tree.openNode(['Viele Datensätze', 'Ordner_F', 'Ordner_5', 'Dataset - 22u']);
    CopyCutUtils.move();
    Tree.selectNodeAndCheckPath('Dataset - 22u', ['Daten']);
  });

  it('delete some data', () => {
    DocumentPage.visit();
    Tree.openNode(['Viele Datensätze', 'Ordner_I', 'Ordner_8', 'Dataset - z60']);
    cy.contains('.title', 'Dataset - z60');
    DocumentPage.deleteLoadedNode();
  });

  it('create a new dataset in a nested folder', () => {
    DocumentPage.visit();
    Tree.openNode(['Viele Datensätze', 'Ordner_G', 'Ordner_10']);
    DocumentPage.createDocument('newDataset - 9yu');
  });

  it('search on document page', () => {
    DocumentPage.visit();
    DocumentPage.search('freeDataset - yol');
    DocumentPage.getSearchResult().contains('freeDataset - yol').click();
    // add timeout to 6s because it takes more than 4s to fetch the document in massData catalog
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'freeDataset - yol');
  });
});
