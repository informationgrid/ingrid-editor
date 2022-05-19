import { DocumentPage, fieldsForDownloadEntry, headerElements, PublishOptions } from '../../../pages/document.page';
import { Tree } from '../../../pages/tree.partial';
import { uvpPage } from '../../../pages/uvp.page';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { CopyCutUtils } from '../../../pages/copy-cut-utils';

describe('uvp uploads', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    DocumentPage.visit();
  });

  it('should be possible to download file after upload has been removed and corresponding document saved (#3831) (2)', () => {
    const fileName = 'export.xml';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_13']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      uvpPage.tryToAccessFile(id, fileName, 200);
      // add replacing file (disposable step if document is changed in database to have more files attached)
      enterMcloudDocTestData.openDownloadDialog();
      enterMcloudDocTestData.uploadFile('Test.pdf');
      // delete file from document and save
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Löschen');
      DocumentPage.saveDocument();
      // make sure file can still be accessed
      uvpPage.tryToAccessFile(id, fileName, 200);
    });
  });

  it('should not download file before corresponding document has been published (#3831) (1)', () => {
    const fileName = 'export.xml';

    Tree.openNode(['Plan_Ordner_4', 'Plan_R_12']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to unpublished document
      uvpPage.tryToAccessFile(id, fileName, 404);
      // publish document
      DocumentPage.publishNow();
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 200);
    });
  });

  it('should not be possible to download file after upload has been removed and corresponding document published (#3831) (3)', () => {
    const fileName = 'research(5).csv';
    const docName = 'Plan_Z_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      uvpPage.tryToAccessFile(id, fileName, 200);
      // add replacing file (disposable step if document is changed in database to have more files attached)
      enterMcloudDocTestData.openDownloadDialog();
      enterMcloudDocTestData.uploadFile('Test.pdf');
      // delete file from document and save
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Löschen');
      DocumentPage.saveDocument();
      // re-publish
      DocumentPage.publishNow();
      // check that file not accessible anymore
      uvpPage.tryToAccessFile(id, fileName, 404);
    });
  });

  it('should not be possible to download file after deleting corresponding published document (#3831) (4)', () => {
    const fileName = 'export.xml';

    Tree.openNode(['Plan_Ordner_4', 'Plan_R_12']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to document
      uvpPage.tryToAccessFile(id, fileName, 200);
      // delete document
      DocumentPage.deleteLoadedNode();
      // make sure download is not possible anymore
      uvpPage.tryToAccessFile(id, fileName, 404);
    });
  });

  it('should not be possible to download file after publication of corresponding document has been revoked (#3831) (5)', () => {
    const fileName = 'export(2).xml';
    const docName = 'Plan_A_12';

    Tree.openNode(['Plan_Ordner_4', docName]);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      uvpPage.tryToAccessFile(id, fileName, 200);
      // revoke publication
      DocumentPage.choosePublishOption(PublishOptions.Unpublish);
      cy.contains('mat-dialog-container', 'Veröffentlichung zurückziehen');
      cy.contains('button', 'Zurückziehen').click();
      // check header
      cy.get('.title mat-icon.working').should('exist');
      // check that file not accessible anymore
      uvpPage.tryToAccessFile(id, fileName, 404);
    });
  });

  it('should not be possible to download file of document with planned publishing until document is published (#3831) (6)', () => {
    const fileName = 'report(4).csv';
    const docName = 'Plan_A_14';

    Tree.openNode(['Plan_Ordner_4', docName]);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // check that file not yet accessible
      uvpPage.tryToAccessFile(id, fileName, 404);
    });
  });

  it('should make available for download the uploads belonging to the copy if document has been copied and published (#3831) (7)', () => {
    const fileName = 'export(21).json';
    const docName = 'Plan_R_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // copy document
    CopyCutUtils.copyObject();
    // publish document
    Tree.openNode([docName]);
    DocumentPage.publishNow();
    // check that file is accessible
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 200);
    });
  });

  it('should be possible to download file of document until expiry of valid-until-date (#3831) (8)', () => {
    const fileName = 'export(23).json';
    const docName = 'Plan_Z_11';

    Tree.openNode(['Plan_Ordner_4', docName]);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 200);
      // set expiry date in the future
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Bearbeiten');
      DocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.ValidUntil, '12.12.2027');
      // check file still accessible
      uvpPage.tryToAccessFile(id, fileName, 200);
    });
  });

  it('should not be possible to download file of document after expiry of valid-until-date (#3831) (9)', () => {
    const fileName = 'export(4).csv';
    const docName = 'Plan_Z_12';

    Tree.openNode(['Plan_Ordner_4', docName]);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 200);
      // set expiry date in the past
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Bearbeiten');
      DocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.ValidUntil, '12.12.2020');
      // check file not accessible anymore
      uvpPage.tryToAccessFile(id, fileName, 200);
    });
  });
});
