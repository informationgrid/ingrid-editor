import { fieldsForDownloadEntry, headerElements, PublishOptions } from '../../../pages/document.page';
import { Tree } from '../../../pages/tree.partial';
import { UvpDocumentPage } from '../../../pages/uvpDocumentPage';
import { CopyCutUtils } from '../../../pages/copy-cut-utils';
import { BehavioursPage } from '../../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../../pages/base.page';
import { fileDataTransferManagement, FileHandlingOptions } from '../../../pages/fileDataTransferManagement.page';

describe('uvp uploads', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    UvpDocumentPage.visit();
  });

  it('should be possible to download file after upload has been removed and corresponding document saved (#3831) (2)', () => {
    const fileName = 'importtest_1.json';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_13']);
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // add file
      fileDataTransferManagement.openUploadDialog();
      fileDataTransferManagement.uploadFile(fileName);
      UvpDocumentPage.publishNow();
      // access file
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
      // delete file from document and save
      UvpDocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Löschen');
      UvpDocumentPage.saveDocument();
      // make sure file can still be accessed
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should not download file before corresponding document has been published (#3831) (1)', () => {
    const fileName = 'importtest_2.json';
    const docName = 'Plan_A_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.saveDocument();
    // get id of document
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to unpublished document
      UvpDocumentPage.tryToAccessFile(id, fileName, 'failure');
      // publish document
      UvpDocumentPage.publishNow();
      // make sure download is possible
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should not be possible to download file after upload has been removed and corresponding document published (#3831) (3)', () => {
    const fileName = 'importtest_3.json';
    const docName = 'Plan_Z_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.publishNow();
    // get id
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
      // delete file from document and save
      UvpDocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Löschen');
      // re-publish
      UvpDocumentPage.publishNow();
      // check that file not accessible anymore
      UvpDocumentPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should not be possible to download file after deleting corresponding published document (#3831) (4)', () => {
    const fileName = 'example.json';

    Tree.openNode(['Plan_Ordner_4', 'Plan_R_12']);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.publishNow();
    // get id
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to document
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
      // delete document
      UvpDocumentPage.deleteLoadedNode();
      // make sure download is not possible anymore
      UvpDocumentPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should not be possible to download file after publication of corresponding document has been revoked (#3831) (5)', () => {
    const fileName = 'Test.pdf';
    const docName = 'Plan_A_12';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.publishNow();
    // get id
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
      // revoke publication
      UvpDocumentPage.choosePublishOption(PublishOptions.Unpublish);
      cy.contains('mat-dialog-container', 'Veröffentlichung zurückziehen');
      cy.contains('button', 'Zurückziehen').click();
      // check header
      cy.get('.title mat-icon.working').should('exist');
      // check that file not accessible anymore
      UvpDocumentPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should not be possible to download file of document with planned publishing until document is published (#3831) (6)', () => {
    const fileName = 'importtest_3.json';
    const docName = 'Plan_Z_13';
    const publishDate = '12.12.2028';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    // plan publishing
    UvpDocumentPage.planPublishing(publishDate);
    // get id
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // check that file not yet accessible
      UvpDocumentPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should make available for download the uploads belonging to the copy if document has been copied and published (#3831) (7)', () => {
    const fileName = 'importtest_5.json';
    const docName = 'Plan_R_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.saveDocument();
    // copy document
    CopyCutUtils.copyObject();
    // publish document
    Tree.openNode([docName]);
    UvpDocumentPage.publishNow();
    // check that file is accessible
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should be possible to download file of document until expiry of valid-until-date (#3831) (8)', () => {
    const fileName = 'importtest_4.json';
    const docName = 'Plan_Z_11';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.publishNow();
    // get id
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
      // set expiry date in the future
      UvpDocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Bearbeiten');
      UvpDocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.ValidUntil, '12.12.2027');
      // check file still accessible
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should not be possible to download file of document after expiry of valid-until-date (#3831) (9)', () => {
    const fileName = 'importtest_2.json';
    const docName = 'Plan_Z_12';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileName);
    UvpDocumentPage.publishNow();
    // get id
    UvpDocumentPage.openUpDocumentHeader();
    UvpDocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      UvpDocumentPage.tryToAccessFile(id, fileName, 'success');
      // set expiry date in the past
      UvpDocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Bearbeiten');
      UvpDocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.ValidUntil, '12.12.2020');
      UvpDocumentPage.publishNow();
      // check file not accessible anymore
      UvpDocumentPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should upload all document types within Öffentliche Auslegung (#4031)', () => {
    let files = [
      'Auslegungsinformationen.pdf',
      'UVP_Bericht_Antragsunterlagen.pdf',
      'Berichte und Empfehlungen.pdf',
      'Weitere Unterlagen.pdf'
    ];

    Tree.openNode(['Plan_R_Dirty_Uploads', 'All_Document_Types']);
    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.uploadFile('Auslegungsinformationen.pdf');

    fileDataTransferManagement.openUploadDialog('UVP Bericht/Antragsunterlagen', 0);
    fileDataTransferManagement.uploadFile('UVP_Bericht_Antragsunterlagen.pdf');

    fileDataTransferManagement.openUploadDialog('Berichte und Empfehlungen', 0);
    fileDataTransferManagement.uploadFile('Berichte und Empfehlungen.pdf');

    fileDataTransferManagement.openUploadDialog('Weitere Unterlagen', 0);
    fileDataTransferManagement.uploadFile('Weitere Unterlagen.pdf');

    UvpDocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    UvpDocumentPage.checkTableEntry(0, 'Weitere Unterlagen', files[3]);
    UvpDocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', files[2]);
    UvpDocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', files[1]);
    UvpDocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[0]);
  });

  it('should add multiple procedure steps of type "Öffentliche Auslegung" to document of type "Raumordnungsverfahren" (#4031)', () => {
    let files = ['Auslegungsinformationen.pdf', 'Test.pdf', 'Weitere Unterlagen.pdf'];
    Tree.openNode(['Plan_R_Dirty_Uploads', 'Multiple_Öffentliche_Auslegung']);
    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.uploadFile(files[0]);

    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 1);
    fileDataTransferManagement.uploadFile(files[1]);

    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog('Weitere Unterlagen', 2);
    fileDataTransferManagement.uploadFile(files[2]);
    UvpDocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    UvpDocumentPage.checkTableEntry(2, 'Weitere Unterlagen', files[2]);
    UvpDocumentPage.checkTableEntry(1, 'Auslegungsinformationen', files[1]);
    UvpDocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[0]);
  });

  it('should upload multiple files at the same time (#4031)', () => {
    let files = ['Auslegungsinformationen.pdf', 'Test.pdf', 'Weitere Unterlagen.pdf'];
    Tree.openNode(['Plan_R_Dirty_Uploads', 'Multiple_Files_Simultaneously']);
    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.uploadFile(files[0], false, false);
    fileDataTransferManagement.uploadFile(files[1], false, false);
    fileDataTransferManagement.uploadFile(files[2], false, false);
    cy.contains('button', 'Übernehmen').click();
    //  wait for files to appear in table, otherwise dataset might be saved without the entries
    UvpDocumentPage.checkTableMultipleEntries(0, 'Auslegungsinformationen', files);
    UvpDocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    // check again after save
    UvpDocumentPage.checkTableMultipleEntries(0, 'Auslegungsinformationen', files);
  });

  it('should upload multiple zip files with same names of the content, unzip the files, save them and check for the included files (#4031)', () => {
    const fileName = 'zip_files_to_save.zip';
    const fileName_2 = 'zip_files_to_save_2.zip';
    const fileTitle = 'zip_files_to_save/';
    const fileTitle_2 = 'zip_files_to_save_2/';
    const documentType = 'Auslegungsinformationen';
    const unzippedFiles: string[] = ['test_file_1.PNG', 'test_file_2.PNG', 'test_file_3.PNG', 'test_image_6.PNG'];

    Tree.openNode(['Plan_R_Dirty_Uploads', 'Save_Extracted_Zip_Files']);
    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog(documentType, 0);
    // upload the files and save the document
    fileDataTransferManagement.uploadFile(fileName, false, false);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.uploadFile(fileName_2, false, false);
    cy.contains('button', 'Übernehmen').click();
    // wait for files to appear in table, otherwise dataset might be saved without the entries
    UvpDocumentPage.checkTableMultipleEntries(0, documentType, unzippedFiles, fileTitle);
    UvpDocumentPage.checkTableMultipleEntries(0, documentType, unzippedFiles, fileTitle_2);
    UvpDocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    // check for every file
    UvpDocumentPage.checkTableMultipleEntries(0, documentType, unzippedFiles, fileTitle);
    UvpDocumentPage.checkTableMultipleEntries(0, documentType, unzippedFiles, fileTitle_2);
  });

  it('should upload zip file with special characters, unzip, save it and check for the included files (#4031)', () => {
    const fileName = 'files with special_characters $&()...!.zip';
    const fileTitle = 'files with special_characters $&()...!/';
    const documentType = 'Auslegungsinformationen';
    const unzippedFiles: string[] = [
      'files with special_characters $&...!..pdf',
      'files with special_characters $&...!.2.pdf',
      'files with special_characters $&...!.3.pdf'
    ];

    Tree.openNode(['Plan_R_Dirty_Uploads', 'Zip_File_Special_Characters']);
    UvpDocumentPage.addProcedureSteps('Öffentliche Auslegung');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.uploadFile(fileName, false, false);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    cy.contains('button', 'Übernehmen').click();
    //  wait for files to appear in table, otherwise dataset might be saved without the entries
    UvpDocumentPage.checkTableMultipleEntries(0, documentType, unzippedFiles, fileTitle);
    UvpDocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    UvpDocumentPage.checkTableMultipleEntries(0, documentType, unzippedFiles, fileTitle);
  });

  it('should activate publish option in catalog behavior for negative preliminary and upload a file (#4031)', () => {
    const fileTitle = 'Test.pdf';
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    BehavioursPage.setCatalogSetting("'Negative Vorprüfungen' veröffentlichen", true);
    // used visit to reload the page
    UvpDocumentPage.visit();
    Tree.openNode(['Plan_N_With_Upload']);
    cy.contains('button', 'Dateien hochladen').click();
    fileDataTransferManagement.uploadFile(fileTitle);
    UvpDocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    // check entry in table
    cy.contains('[data-cy="Ergebnis der UVP-Vorprüfung-table"]', fileTitle);
    cy.get('[data-cy="Ergebnis der UVP-Vorprüfung-table"] mat-row').should('have.length', 1);
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    BehavioursPage.setCatalogSetting("'Negative Vorprüfungen' veröffentlichen", false);
  });
});
