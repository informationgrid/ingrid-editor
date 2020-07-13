import {DocumentPage} from '../../pages/document.page';
import {Tree} from '../../pages/tree.partial';

describe('Toolbar behavior', () => {

  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('/form');
    cy.get('mat-toolbar').should('be.visible');
  });

  it('initially only create folder and create doc are enabled', () => {
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder']);
  });

  it('should activate specific buttons when a folder is loaded', () => {
    Tree.selectNodeWithTitle('Neue Testdokumente');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Preview', 'Copy', 'Delete', 'Save']);

    // TODO: copy/move with subtree should be enabled


  });

  xit('should activate specific buttons when a document is loaded', () => {
    Tree.selectNodeWithTitle('zzz');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Preview', 'Copy', 'Delete', 'Save', 'Publish']);

    // TODO: copy/move with subtree should be disabled
  });

  xit('should activate specific buttons when a published document is loaded', () => {
    Tree.selectNodeWithTitle('ddd');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Preview', 'Copy', 'Delete', 'Save', 'Publish']);
  });

  xit('should activate specific buttons when a published document with draft is loaded', () => {
    Tree.selectNodeWithTitle('published with working');
    DocumentPage.checkOnlyActiveToolbarButtons(['NewDoc', 'NewFolder', 'Preview', 'Copy', 'Revert', 'Delete', 'Save', 'Publish']);
  });

})
