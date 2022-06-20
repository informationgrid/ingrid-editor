import { ExportPage } from '../../../pages/export.page';
import { Tree } from '../../../pages/tree.partial';

describe('Export', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    ExportPage.visit();
  });

  it('should export a single published document with options "Nur diesen Datensatz", "IGE" ', () => {
    Tree.openNode(['document_to_export'], false);
    ExportPage.continue();
    ExportPage.selectExportOption('nur diesen Datensatz');
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
    ExportPage.selectExportOption('nur diesen Datensatz');
    ExportPage.checkDraftOption();
    //go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  xit('should exportExport of a subtree with options: "alle untergeordneten", "IGE")  ', () => {
    Tree.openNode(['folder_to_export_draft_files'], false);
    ExportPage.continue();
    ExportPage.selectExportOption('alle untergeordneten');
    ExportPage.checkDraftOption();
    //go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

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
