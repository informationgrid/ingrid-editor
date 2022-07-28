import { ExportPage } from '../../../pages/export.page';
import { Tree } from '../../../pages/tree.partial';

describe('Export', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    ExportPage.visit();
  });

  it('should export a fully completed document with option "IGE" ', () => {
    Tree.openNode(['Plan_A'], false);
    ExportPage.continue();
    // move back and forth and click on cancel to check the steps functionality
    ExportPage.back();
    ExportPage.continue();
    ExportPage.cancel();
    // click on the node again
    Tree.openNode(['Plan_A'], false);
    ExportPage.continue();
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  it('should export a fully completed document with option "IDF"', () => {
    Tree.openNode(['Plan_A'], false);

    ExportPage.continue();
    ExportPage.selectOption('UVP IDF');
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    // TODO: check for content
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });

  it('should export a fully completed document with option "UVP IDF (Elasticsearch)"', () => {
    Tree.openNode(['Plan_A'], false);

    ExportPage.continue();
    ExportPage.selectOption('UVP IDF (Elasticsearch)');
    // go to preview step
    ExportPage.continue();
    ExportPage.preview();
    // TODO: check for content
    ExportPage.closePreview();
    ExportPage.exportFile();
    ExportPage.checkForFileDownload('export.json');
  });
});
