import { ExportPage } from '../../pages/export.page';
import { Tree } from '../../pages/tree.partial';

describe('mCLOUD: Export', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    ExportPage.visit();
  });

  it('should export a completed document with option "mCLOUD Portal" ', () => {
    Tree.openNode(['TestDocResearch4'], false);
    ExportPage.continue();
    ExportPage.selectOption('mCLOUD Portal');
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  it('should export a completed document with option "mCLOUD DCAT-AP.de" ', () => {
    Tree.openNode(['TestDocResearch4'], false);
    ExportPage.continue();
    // TODO select "Nur diesen Datensatz"
    //  --------------
    ExportPage.selectOption('mCLOUD DCAT-AP.de');
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    // TODO: check for content
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });
});

describe('Export', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    ExportPage.visit();
  });

  it('should export a single published document with options "Nur diesen Datensatz", "IGE" ', () => {
    Tree.openNode(['document_to_export'], false);
    ExportPage.continue();
    // move back and forth and click on cancel to check the steps functionality
    ExportPage.back();
    ExportPage.continue();
    ExportPage.cancel();
    // click on the node again
    Tree.openNode(['document_to_export'], false);
    ExportPage.continue();
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  it('should export a single published document that is in progress with options "Nur diesen Datensatz","IGE" and "Auch Entwürfe exportieren" ', () => {
    Tree.openNode(['published_document_in_progress'], false);
    ExportPage.continue();
    ExportPage.checkDraftOption();
    //go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  // bug is covered by #2502
  xit('should exportExport of a subtree with options: "alle untergeordneten", "IGE")  ', () => {
    Tree.openNode(['folder_to_export_draft_files'], false);
    ExportPage.continue();
    ExportPage.selectExportOption('alle untergeordneten');
    ExportPage.checkDraftOption();
    //go to preview step
    ExportPage.continue();
    // give it little time to load the content
    cy.wait(300);
    ExportPage.preview();
    ExportPage.checkPreviewContent('first_draft_document');
    ExportPage.checkPreviewContent('second_draft_document');
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  // this test is pending right now because option "dieser und alle untergeordneten" preduce the same result as "alle untergeordneten"
  xit('should exportExport of a subtree  including the selected one with options: "dieser und alle untergeordneten", "IGE")  ', () => {
    Tree.openNode(['folder_to_export_draft_files'], false);
    ExportPage.continue();
    ExportPage.selectExportOption('dieser und alle untergeordneten');
    ExportPage.checkDraftOption();
    //go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });
});
