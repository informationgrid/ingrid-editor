import { DocumentPage } from '../../../pages/document.page';
import { Tree } from '../../../pages/tree.partial';
import { Utils } from '../../../pages/utils';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';

describe('Upload Tests', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user').as('tokens');
    DocumentPage.visit();
  });

  it('should upload a file (#3575 (1))', () => {
    const fileTitle = 'Test.pdf';

    Tree.openNode(['Neue Testdokumente', 'Datum_Ebene_2_1']);
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    enterMcloudDocTestData.DownloadFileAddedToDocument(fileTitle);
    enterMcloudDocTestData.verifyExistenceOfDownloadedFile(fileTitle);
  });
});
