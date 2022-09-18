import { DocumentPage, fieldsForDownloadEntry, headerElements, PublishOptions } from '../../../pages/document.page';
import { Tree } from '../../../pages/tree.partial';
import { uvpPage } from '../../../pages/uvp.page';
import { enterMcloudDocTestData, FileHandlingOptions } from '../../../pages/enterMcloudDocTestData';
import { CopyCutUtils } from '../../../pages/copy-cut-utils';
import { BehavioursPage } from '../../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../../pages/base.page';

describe('uvp uploads', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    DocumentPage.visit();
  });

  it('should be possible to download file after upload has been removed and corresponding document saved (#3831) (2)', () => {
    const fileName = 'importtest_1.json';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_13']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // add file
      enterMcloudDocTestData.openDownloadDialog();
      enterMcloudDocTestData.uploadFile(fileName);
      DocumentPage.publishNow();
      // access file
      uvpPage.tryToAccessFile(id, fileName, 'success');
      // delete file from document and save
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Löschen');
      DocumentPage.saveDocument();
      // make sure file can still be accessed
      uvpPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should not download file before corresponding document has been published (#3831) (1)', () => {
    const fileName = 'importtest_2.json';
    const docName = 'Plan_A_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.saveDocument();
    // get id of document
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to unpublished document
      uvpPage.tryToAccessFile(id, fileName, 'failure');
      // publish document
      DocumentPage.publishNow();
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should not be possible to download file after upload has been removed and corresponding document published (#3831) (3)', () => {
    const fileName = 'importtest_3.json';
    const docName = 'Plan_Z_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.publishNow();
    // get id
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      uvpPage.tryToAccessFile(id, fileName, 'success');
      // delete file from document and save
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Löschen');
      // re-publish
      DocumentPage.publishNow();
      // check that file not accessible anymore
      uvpPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should not be possible to download file after deleting corresponding published document (#3831) (4)', () => {
    const fileName = 'example.json';

    Tree.openNode(['Plan_Ordner_4', 'Plan_R_12']);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.publishNow();
    // get id
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to document
      uvpPage.tryToAccessFile(id, fileName, 'success');
      // delete document
      DocumentPage.deleteLoadedNode();
      // make sure download is not possible anymore
      uvpPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should not be possible to download file after publication of corresponding document has been revoked (#3831) (5)', () => {
    const fileName = 'Test.pdf';
    const docName = 'Plan_A_12';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.publishNow();
    // get id
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file
      uvpPage.tryToAccessFile(id, fileName, 'success');
      // revoke publication
      DocumentPage.choosePublishOption(PublishOptions.Unpublish);
      cy.contains('mat-dialog-container', 'Veröffentlichung zurückziehen');
      cy.contains('button', 'Zurückziehen').click();
      // check header
      cy.get('.title mat-icon.working').should('exist');
      // check that file not accessible anymore
      uvpPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should not be possible to download file of document with planned publishing until document is published (#3831) (6)', () => {
    const fileName = 'importtest_3.json';
    const docName = 'Plan_Z_13';
    const publishDate = '12.12.2028';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    // plan publishing
    DocumentPage.planPublishing(publishDate);
    // get id
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // check that file not yet accessible
      uvpPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should make available for download the uploads belonging to the copy if document has been copied and published (#3831) (7)', () => {
    const fileName = 'importtest_5.json';
    const docName = 'Plan_R_10';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.saveDocument();
    // copy document
    CopyCutUtils.copyObject();
    // publish document
    Tree.openNode([docName]);
    DocumentPage.publishNow();
    // check that file is accessible
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should be possible to download file of document until expiry of valid-until-date (#3831) (8)', () => {
    const fileName = 'importtest_4.json';
    const docName = 'Plan_Z_11';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.publishNow();
    // get id
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 'success');
      // set expiry date in the future
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Bearbeiten');
      DocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.ValidUntil, '12.12.2027');
      // check file still accessible
      uvpPage.tryToAccessFile(id, fileName, 'success');
    });
  });

  it('should not be possible to download file of document after expiry of valid-until-date (#3831) (9)', () => {
    const fileName = 'importtest_2.json';
    const docName = 'Plan_Z_12';

    Tree.openNode(['Plan_Ordner_4', docName]);
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile(fileName);
    DocumentPage.publishNow();
    // get id
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 'success');
      // set expiry date in the past
      DocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', fileName, 'Bearbeiten');
      DocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.ValidUntil, '12.12.2020');
      DocumentPage.publishNow();
      // check file not accessible anymore
      uvpPage.tryToAccessFile(id, fileName, 'failure');
    });
  });

  it('should upload all document types within Öffentliche Auslegung #4031', () => {
    let files = [
      'Auslegungsinformationen.pdf',
      'UVP_Bericht_Antragsunterlagen.pdf',
      'Berichte und Empfehlungen.pdf',
      'Weitere Unterlagen.pdf'
    ];

    Tree.openNode(['Plan_R_Dirty_Uploads', 'All_Document_Types']);
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('Auslegungsinformationen.pdf');
    DocumentPage.addTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('UVP_Bericht_Antragsunterlagen.pdf');
    DocumentPage.addTableEntry(0, 'Berichte und Empfehlungen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('Berichte und Empfehlungen.pdf');
    DocumentPage.addTableEntry(0, 'Weitere Unterlagen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('Weitere Unterlagen.pdf');
    DocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', files[3]);
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', files[2]);
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', files[1]);
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[0]);
  });

  it('should add multiple procedure steps of type "Öffentliche Auslegung" to document of type "Raumordnungsverfahren" #4031', () => {
    let files = ['Auslegungsinformationen.pdf', 'Test.pdf', 'Weitere Unterlagen.pdf'];
    Tree.openNode(['Plan_R_Dirty_Uploads', 'Multiple_Öffentliche_Auslegung']);
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile(files[0]);

    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(1, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile(files[1]);

    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(2, 'Weitere Unterlagen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile(files[2]);
    DocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    DocumentPage.checkTableEntry(2, 'Weitere Unterlagen', files[2]);
    DocumentPage.checkTableEntry(1, 'Auslegungsinformationen', files[1]);
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[0]);
  });

  it('should upload multiple files at the same time #4031', () => {
    let files = ['Auslegungsinformationen.pdf', 'Test.pdf', 'Weitere Unterlagen.pdf'];
    Tree.openNode(['Plan_R_Dirty_Uploads', 'Multiple_Files_Simultaneously']);
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile(files[0], false, false);
    enterMcloudDocTestData.uploadFile(files[1], false, false);
    enterMcloudDocTestData.uploadFile(files[2], false, false);
    cy.contains('button', 'Übernehmen').click();
    // TODO: wait for files to appear in table, otherwise dataset might be saved without the entries
    DocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[2]);
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[1]);
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', files[0]);
  });

  it('should upload multiple zip files with same names of the content, unzip the files, save them and check for the included files #4031', () => {
    const fileName = 'zip_files_to_save.zip';
    const fileName_2 = 'zip_files_to_save_2.zip';
    const fileTitle = 'zip_files_to_save/';
    const fileTitle_2 = 'zip_files_to_save_2/';
    const documentType = 'Auslegungsinformationen';
    const unzippedFiles: string[] = ['test_file_1.PNG', 'test_file_2.PNG', 'test_file_3.PNG', 'test_image_6.PNG'];

    Tree.openNode(['Plan_R_Dirty_Uploads', 'Save_Extracted_Zip_Files']);
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(0, documentType, 'Dateien hochladen');
    // upload the files and save the document
    enterMcloudDocTestData.uploadFile(fileName, false, false);
    enterMcloudDocTestData.unzipArchiveAfterUpload();
    enterMcloudDocTestData.uploadFile(fileName_2, false, false);
    cy.contains('button', 'Übernehmen').click();
    // TODO: wait for files to appear in table, otherwise dataset might be saved without the entries
    DocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    // check for every file
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[3]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[2]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[1]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[0]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle_2 + unzippedFiles[3]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle_2 + unzippedFiles[2]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle_2 + unzippedFiles[1]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle_2 + unzippedFiles[0]);
  });

  it('should upload zip file with special characters, unzip, save it and check for the included files #4031', () => {
    const fileName = 'files with special_characters $&()...!.zip';
    const fileTitle = 'files with special_characters $&()...!/';
    const documentType = 'Auslegungsinformationen';
    const unzippedFiles: string[] = [
      'files with special_characters $&...!..pdf',
      'files with special_characters $&...!.2.pdf',
      'files with special_characters $&...!.3.pdf'
    ];

    Tree.openNode(['Plan_R_Dirty_Uploads', 'Zip_File_Special_Characters']);
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile(fileName, false, false);
    enterMcloudDocTestData.unzipArchiveAfterUpload();
    cy.contains('button', 'Übernehmen').click();
    // TODO: wait for files to appear in table, otherwise dataset might be saved without the entries
    DocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[2]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[1]);
    DocumentPage.checkTableEntry(0, documentType, fileTitle + unzippedFiles[0]);
  });

  it('should activate publish option in catalog behavior for negative preliminary and upload a file #4031', () => {
    const fileTitle = 'Test.pdf';
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    BehavioursPage.setCatalogSetting("'Negative Vorprüfungen' veröffentlichen", true);
    // used visit to reload the page
    DocumentPage.visit();
    Tree.openNode(['Plan_N_With_Upload']);
    cy.contains('button', 'Dateien hochladen').click();
    enterMcloudDocTestData.uploadFile(fileTitle);
    DocumentPage.saveDocument();
    cy.pageReload('dashboard-docs-header');
    // check entry in table
    cy.contains('[data-cy="Ergebnis der UVP-Vorprüfung-table"]', fileTitle);
    cy.get('[data-cy="Ergebnis der UVP-Vorprüfung-table"] mat-row').should('have.length', 1);
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    BehavioursPage.setCatalogSetting("'Negative Vorprüfungen' veröffentlichen", false);
  });
});
