import { ExportPage } from '../../pages/export.page';
import { Tree } from '../../pages/tree.partial';

describe('Export', () => {
  beforeEach(() => {
    cy.kcLogout();
  });

  it('should export a single published document with options "Nur diesen Datensatz", "IGE" ', () => {
    cy.kcLogin('user').as('tokens');
    ExportPage.visit();
    Tree.openNode(['TestDocResearch4'], false, true);
    ExportPage.continue();
    // TODO select "Nur diesen Datensatz"
    //  --------------

    // move back and forth and click on cancel to check the steps functionality
    ExportPage.back();
    ExportPage.continue();
    ExportPage.cancel();
    // click on the node again
    Tree.openNode(['TestDocResearch4'], false, true);
    ExportPage.continue();
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
    ExportPage.newExport();
  });
});
