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
    ExportPage.checkForFileDownload('e5bc272c-142b-4ad6-8278-093e3de74b7c.json');
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
    ExportPage.checkForFileDownload('e5bc272c-142b-4ad6-8278-093e3de74b7c.json');
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
    ExportPage.checkForFileDownload('bdd57671-66b6-471f-b787-f41590e7a416.json');
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
    ExportPage.checkForFileDownload('d7f79de1-6bcb-4fa8-893b-da3c5688b52e.json');
  });

  it('should not show preview for exported folders', () => {
    Tree.openNode(['folder_to_export_draft_files'], false);
    ExportPage.continue();
    ExportPage.checkDraftOption();
    //go to preview step
    ExportPage.continue();
    // give it little time to load the content
    cy.wait(300);
    cy.contains('.mat-horizontal-stepper-content', 'Für ZIP-Dateien gibt es keine Vorschau');
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('aa1d85e5-ca82-4676-b746-d19a7d1744a8.zip');
  });
});
