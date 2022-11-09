import { DocumentPage } from '../../pages/document.page';
import { Tree } from '../../pages/tree.partial';
import { McloudDocumentPage } from '../../pages/mcloudDocument.page';
import { FileHandlingOptions, fileDataTransferManagement } from '../../pages/fileDataTransferManagement.page';

describe('mCLOUD: Upload Tests', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    DocumentPage.visit();
  });

  it('should upload a file (#3575 (1))', () => {
    const fileTitle = 'Test.pdf';

    Tree.openNode(['Neue Testdokumente', 'Datum_Ebene_2_1']);
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    fileDataTransferManagement.DownloadFileAddedToDocument(fileTitle);
    fileDataTransferManagement.verifyExistenceOfDownloadedFile(fileTitle);
  });

  it('should remove file from upload dialog (#3575 (2))', () => {
    const fileTitle = 'Test.pdf';

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.removeFileFromUploadDialog();
    cy.contains('button', 'Übernehmen').should('be.disabled');
  });

  it('should overwrite uploaded file when uploading file with same name (#3575 (3))', () => {
    const fileTitle = 'Test.pdf';

    // upload file
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B', 'Datum_Ebene_4_3']);
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    // try to upload file with same name
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addAlreadyExistingFile(fileTitle);
    // choose option "Überschreiben"
    fileDataTransferManagement.handleExistingFile(FileHandlingOptions.Overwrite);
    cy.contains('button', 'Übernehmen').click();
    // make sure that there is still only one entry in the table
    fileDataTransferManagement.checkForOneEntryForTable();
  });

  it('should rename uploaded file when uploading file with same name (#3575 (4))', () => {
    const fileTitle = 'Test.pdf';
    const newFileTitle = 'Test-1.pdf';

    // upload file
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2B', 'Datum_Ebene_3_1']);
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    // try to upload file with same name
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addAlreadyExistingFile(fileTitle);
    // choose option "Umbenennen"
    fileDataTransferManagement.handleExistingFile(FileHandlingOptions.Rename);
    cy.contains('button', 'Übernehmen').click();
    // make sure the file name has been changed and new entry has been added
    cy.contains('[data-cy="Downloads-table"]', newFileTitle);
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 2);
    // download new entry
    fileDataTransferManagement.DownloadFileAddedToDocument(newFileTitle);
    fileDataTransferManagement.verifyExistenceOfDownloadedFile(newFileTitle);
  });

  it('should choose existing file when uploading file with same name (#3575 (5))', () => {
    const fileTitle = 'Test.pdf';

    // upload file
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3D', 'Datum_Ebene_4_7']);
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    // try to upload file with same name
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addAlreadyExistingFile(fileTitle);
    // choose option "Existierende verwenden"
    fileDataTransferManagement.handleExistingFile(FileHandlingOptions.UseExisting);
    cy.contains('button', 'Übernehmen').click();
    // make sure no file name has been changed and no new entry has been added
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    fileDataTransferManagement.checkForOneEntryForTable();
    // download old entry
    fileDataTransferManagement.DownloadFileAddedToDocument(fileTitle);
    fileDataTransferManagement.verifyExistenceOfDownloadedFile(fileTitle);
  });

  it('should upload a zip-file (#3575 (6))', () => {
    const fileTitle = 'Test.zip';

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3D', 'Datum_Ebene_4_8']);
    // check no file has been added yet
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // upload file
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileTitle);
    // check entry in table
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    fileDataTransferManagement.checkForOneEntryForTable();
    // download file
    fileDataTransferManagement.DownloadFileAddedToDocument(fileTitle);
    fileDataTransferManagement.verifyExistenceOfDownloadedFile(fileTitle);
  });

  it('should upload and unzip a zip-file (#3575 (7))', () => {
    const fileTitle = 'Test.zip';

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B', 'Datum_Ebene_4_4']);
    // check no file has been added yet
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    // check unzipped files in table
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 4);
  });

  it('should upload and unzip new zip archive and overwrite duplicate zip archive files (zip files have same name) (#3575 (8))', () => {
    const fileTitle = 'Test2.zip';
    const unzippedFiles: string[] = ['test_file_1.PNG', 'test_file_2.PNG', 'test_file_3.PNG', 'test_image_6.PNG'];

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3C', 'Datum_Ebene_4_6']);
    // check no file has been added yet
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    // check unzipped files in table
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 4);

    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    // here should appear a dialog pointing to the file extraction conflict!
    fileDataTransferManagement.solveZIPExtractionConflict(FileHandlingOptions.Overwrite);
    // check number of unzipped files in table (3 files with same name, 1 file specific to each zip archive)
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 4);
    cy.get('[data-cy="Downloads-table"] mat-row').each((item, index) => {
      cy.wrap(item).should('contain.text', unzippedFiles[index]);
    });
  });

  it('should upload and unzip new zip archive and overwrite duplicate zip archive files (zip files have same name) (#3575 (8))', () => {
    const fileTitle = 'Test2.zip';
    const toBeOverwritten = 'Test.zip';
    const unzippedFiles: string[] = [
      'test_file_1.PNG',
      'test_file_2.PNG',
      'test_file_3.PNG',
      'test_image_1',
      'test_image_6'
    ];

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Datum_Ebene_3_3']);
    // check no file has been added yet
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(toBeOverwritten);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    // check unzipped files in table
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 4);

    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFileWithRename(fileTitle, 'Test.zip');
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    fileDataTransferManagement.solveZIPExtractionConflict(FileHandlingOptions.Overwrite);
    // check number of unzipped files in table (3 files with same name, 1 file specific to each zip archive)
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 5);
    cy.get('[data-cy="Downloads-table"] mat-row').each((item, index) => {
      cy.wrap(item).should('contain.text', unzippedFiles[index]);
    });
  });

  it('should upload and unzip new zip archive and rename duplicate zip archive files(#3575 (9))', () => {
    const fileTitle = 'Test2.zip';
    const unzippedFiles: string[] = [
      'test_file_1.PNG',
      'test_file_2.PNG',
      'test_file_3.PNG',
      'test_image_6.PNG',
      'test_file_1-1.PNG',
      'test_file_2-1.PNG',
      'test_file_3-1.PNG',
      'test_image_6-1.PNG'
    ];

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2B', 'Datum_Ebene_3_1']);
    // check no file has been added yet
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    // check number of unzipped files in table
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 4);

    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    fileDataTransferManagement.solveZIPExtractionConflict(FileHandlingOptions.Rename);
    // check number of unzipped files in table (4 files with original name, 4 files with modified name)
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 8);
    cy.get('[data-cy="Downloads-table"] mat-row').each((item, index) => {
      cy.wrap(item).should('contain.text', unzippedFiles[index]);
    });
  });

  it('should add and be able to open valid URL added to document (#3575)', () => {
    const url = 'https://docs.cypress.io/guides/overview/why-cypress#In-a-nutshell';

    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', 'Tiefes Dokument']);
    McloudDocumentPage.setAddDownload('open in new tab', url);
    cy.contains('[data-cy="Downloads-table"] mat-row', url);
    cy.get('mat-cell a')
      .should('have.attr', 'target', '_blank')
      .then(link => {
        cy.request(link.prop('href')).its('status').should('eq', 200);
      });
  });

  it('should not add invalid URL to document (#3575)', () => {
    const url = 'https:/.docs.cypress.io/guides/overview/invalidURL';

    Tree.openNode(['Testdokumente', 'Leeres mCloud Test Objekt']);
    fileDataTransferManagement.openAddURLDialog();
    fileDataTransferManagement.fillFieldsOfAddURLDialog('invalid url', url);
    // click outside of url text field so that validation is triggered
    cy.get('mat-dialog-container .mat-select-trigger').click();
    cy.contains('mat-error', 'Verwenden Sie bitte eine gültige URL');
    cy.contains('button', 'Übernehmen').should('be.disabled');
  });

  it('should upload and unzip new zip archive and rename duplicate zip archive files while keeping non-duplicate files with unmodified name (#3346)', () => {
    const fileTitle = 'Test2.zip';
    const toBeRenamed = 'Test.zip';
    const unzippedFiles: string[] = [
      'test_file_1.PNG',
      'test_file_2.PNG',
      'test_file_3.PNG',
      'test_image_6.PNG',
      'test_file_1-1.PNG',
      'test_file_2-1.PNG',
      'test_file_3-1.PNG',
      'test_image_1.PNG'
    ];

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_2']);
    // check no file has been added yet
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFile(fileTitle);
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    // check number of unzipped files in table
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 4);

    // upload file and activate unzip option
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.addFileWithRename(toBeRenamed, 'Test2.zip');
    fileDataTransferManagement.unzipArchiveAfterUpload();
    fileDataTransferManagement.assertFileUpload();
    fileDataTransferManagement.solveZIPExtractionConflict(FileHandlingOptions.Rename);
    // check number of unzipped files in table (5 files with original name, 3 files with modified name)
    cy.get('[data-cy="Downloads-table"] mat-row').should('have.length', 8);
    cy.get('[data-cy="Downloads-table"] mat-row').each((item, index) => {
      cy.wrap(item).should('contain.text', unzippedFiles[index]);
    });
  });

  it('should delete file from download table via batch edit row (#3661 (1))', () => {
    const upload = 'export(16).json';

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2D', 'Ordner_Ebene_3G', 'Datum_Ebene_4_14']);
    // check existence of download table entry
    cy.contains('[data-cy="Downloads-table"] mat-row', upload);
    // delete
    cy.contains('button', 'Bearbeiten').click();
    cy.get('.table-batch-edit-row mat-checkbox').click();
    cy.contains('.table-batch-edit-row button', 'Löschen').click();
    cy.get('[data-cy=confirm-dialog-confirm]').click();

    // check that download table has disappeared
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // check that row to delete entries has disappeared
    cy.get('.table-batch-edit-row').should('not.exist');
    DocumentPage.saveDocument();
    // check that after saving table and row are still not there
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    cy.get('.table-batch-edit-row').should('not.exist');
  });

  it('should delete file from download table via individual button (#3661 (2))', () => {
    const upload = 'export(11).json';

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2D', 'Ordner_Ebene_3H', 'Datum_Ebene_4_15']);
    // check existence of download table entry
    cy.contains('[data-cy="Downloads-table"] mat-row', upload);
    // delete
    DocumentPage.editRowInDownloadTable('Downloads-table', upload, 'Löschen');
    // check that download table has disappeared
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    DocumentPage.saveDocument();
    // check that after saving table is still not there
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
  });

  it('should delete multiple entries from download table via batch edit option', () => {
    const downloadEntries = ['export(7).json', 'export(8).json', 'export(9).json'];

    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2D', 'Ordner_Ebene_3G', 'Datum_Ebene_4_13']);
    // check existence of download table entries
    cy.get('[data-cy="Downloads-table"] mat-row').each((item, index) => {
      cy.wrap(item).should('contain.text', downloadEntries[index]);
    });
    // delete
    cy.contains('button', 'Bearbeiten').click();
    cy.get('.table-batch-edit-row mat-checkbox').click();
    cy.contains('.table-batch-edit-row button', 'Löschen').click();
    cy.get('[data-cy=confirm-dialog-confirm]').click();

    // check that download table has disappeared
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    // check that row to delete entries has disappeared
    cy.get('.table-batch-edit-row').should('not.exist');
    DocumentPage.saveDocument();
    // check that after saving table and row are still not there
    cy.get('[data-cy="Downloads-table"]').should('not.exist');
    cy.get('.table-batch-edit-row').should('not.exist');
  });
});

describe('Upload Tests', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    DocumentPage.visit();
  });

  it('should not upload a file containing "%"(#4122)', () => {
    const illegalFileTitle = 'this%file';
    const fileToBeRenamed = 'Test.pdf';

    Tree.openNode(['Neue Testdokumente', 'Datum_3_1']);
    fileDataTransferManagement.openUploadDialog();
    cy.get('[type="file"]').attachFile({ filePath: fileToBeRenamed, fileName: illegalFileTitle });
    cy.get('error-dialog').should('include', /Dateiname darf kein '%' enthalten/);
  });

  it('should upload a large file 10 MB (#4448)', () => {
    const fileTitle = 'sample-large-file.pdf';

    Tree.openNode(['Testdokumente', 'MC_with_large_file']);
    fileDataTransferManagement.openUploadDialog();
    fileDataTransferManagement.uploadFile(fileTitle);
    cy.contains('[data-cy="Downloads-table"]', fileTitle);
    fileDataTransferManagement.DownloadFileAddedToDocument(fileTitle);
    fileDataTransferManagement.verifyExistenceOfDownloadedFile(fileTitle);
  });
});
