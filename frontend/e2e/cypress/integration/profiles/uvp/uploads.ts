import { DocumentPage, headerElements, PublishOptions } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Address, AddressPage, addressType } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { Menu } from '../../../pages/menu';
import { AddressDetails, UVPmetrics, uvpPage, UVPreports } from '../../../pages/uvp.page';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { CopyCutUtils, CopyOption } from '../../../pages/copy-cut-utils';
import { ResearchPage } from '../../../pages/research.page';
import { BasePage } from '../../../pages/base.page';

describe('uvp uploads', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    DocumentPage.visit();
  });

  it('should not download file before corresponding document has been published (#3831)', () => {
    const fileName = 'research(5).csv';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_10']);
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

  xit('should be possible to download file after upload has been removed and corresponding document saved (#3831) (1)', () => {
    const fileName = 'research(5).csv';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_10']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      uvpPage.tryToAccessFile(id, fileName, 200);
      // add replacing file (disposable step if document is changed in database to have more files attached)
      // modify following method to specify which
      enterMcloudDocTestData.openDownloadDialog();
      enterMcloudDocTestData.uploadFile('Test.pdf');
      // delete file from document and save   -> method: delete file attached to document (s. auch upload.spec.ts)
      cy.get('[data-cy="Downloads-table"] mat-row [svgicon="Mehr"]').click();
      cy.contains('.mat-menu-panel button', 'Löschen').click();
      // check that download table has disappeared
      cy.get('[data-cy="Downloads-table"]').should('not.exist');
      DocumentPage.saveDocument();
      // make sure file can still be accessed
    });
  });
  xit('should not be possible to download file after upload has been removed and corresponding document published (#3831) (2)', () => {});
  xit('should not be possible to download file after publication of corresponding document has been revoked (#3831)', () => {});
  xit('should not be possible to download file of document with planned publishing until document is published (#3831)', () => {});
  xit('should make available for download the uploads belonging to the copy if document has been copied and published (#3831)', () => {});
  xit('should be possible to download file of document until expiry of valid-until-date (#3831)', () => {});
  xit('should not be possible to download file of document after expiry of valid-until-date (#3831)', () => {});
});
