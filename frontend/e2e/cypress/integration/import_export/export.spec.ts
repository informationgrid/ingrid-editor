import { ExportPage } from '../../pages/export.page';
import { Tree } from '../../pages/tree.partial';

describe('Export', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    ExportPage.visit();
  });

  it('should export a completed document with option "mCLOUD Portal" ', () => {
    Tree.openNode(['TestDocResearch4'], false);
    ExportPage.continue();
    // TODO select "Nur diesen Datensatz"
    //  --------------
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
