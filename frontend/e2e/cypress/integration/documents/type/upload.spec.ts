import { DocumentPage } from '../../../pages/document.page';
import { Tree } from '../../../pages/tree.partial';
import { Utils } from '../../../pages/utils';
import { enterMcloudDocTestData, FileHandlingOptions } from '../../../pages/enterMcloudDocTestData';

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

  it('should remove file from upload dialog (#3575 (2))', () => {
    const fileTitle = 'Test.pdf';

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.addFile(fileTitle);
    enterMcloudDocTestData.removeFileFromUploadDialog();
    cy.contains('button', 'Übernehmen').should('be.disabled');
  });

  it('should overwrite uploaded file when uploading file with same name (#3575 (3))', () => {
    const fileTitle = 'Test.pdf';

    // upload file
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B', 'Datum_Ebene_4_3']);
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    // try to upload same file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.addAlreadyExistingFile(fileTitle);
    // choose option "Überschreiben"
    enterMcloudDocTestData.handleExistingFile(FileHandlingOptions.Overwrite);
    cy.contains('button', 'Übernehmen').click();
    // make sure that there is still only one entry in the table
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 1);
  });
});
