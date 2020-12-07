import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';
import { DocumentPage } from '../../pages/document.page';
import { Utils } from '../../pages/utils';
import { Tree } from '../../pages/tree.partial';

describe('Spatial References', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    DocumentPage.visit();
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should create a new spatial reference (bbox)', () => {
    const docName = 'spatialbbox-' + Utils.randomString();

    DocumentPage.createDocument(docName);
    enterMcloudDocTestData.setSpatialBbox('create spatial reference, bbox', 'Bremen');
    DocumentPage.checkSpatialEntryNumber(1);
    DocumentPage.checkSpatialEntryExists('Bremen');

    // TODO: why save at the end?
    DocumentPage.saveDocument();
  });

  it('should create a new spatial reference (WKT)', () => {
    const docName = 'spatialwkt-' + Utils.randomString();
    const poly = 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))';

    DocumentPage.createDocument(docName);
    enterMcloudDocTestData.setSpatialWKT('create spatial reference, wkt-1', poly);
    DocumentPage.checkSpatialEntryNumber(1);
    DocumentPage.checkSpatialEntryExists('reference, wkt-1');

    // TODO: why save at the end?
    DocumentPage.saveDocument();
  });

  it('should add additional a spatial reference (bbox)', () => {
    const docNameBbox = 'spatialbbox-' + Utils.randomString();

    DocumentPage.CreateSpatialBboxWithAPI(docNameBbox, false);
    Tree.openNode(['api-' + docNameBbox]);

    enterMcloudDocTestData.setSpatialBbox('add spatial reference, bbox', 'Berlin');
    DocumentPage.checkSpatialEntryNumber(2);
    DocumentPage.checkSpatialEntryExists('Berlin');

    DocumentPage.saveDocument();

    DocumentPage.clickSpatialEntry('Berlin');
    // TODO: why clicking reset button when there is no check involved?
    //       * do some checks or remove it (write minimal tests!)
    DocumentPage.clickLeafletMapResetBtn();

    DocumentPage.clickSpatialEntry('Bremen');
    DocumentPage.clickLeafletMapResetBtn();
  });

  it('should add additional a spatial reference (WKT)', () => {
    const poly = 'POLYGON((1 5, 5 9, 1 7, 2 1, 3 5)(5 5, 5 7, 7 7, 7 5, 5 5))';
    const docNameBbox = 'spatialwkt-' + Utils.randomString();

    DocumentPage.CreateSpatialWKTWithAPI(docNameBbox, false);
    Tree.openNode(['api-' + docNameBbox]);

    enterMcloudDocTestData.setSpatialWKT('add spatial reference, wkt-2', poly);
    DocumentPage.checkSpatialEntryNumber(2);
    DocumentPage.checkSpatialEntryExists('reference, wkt-2');

    DocumentPage.saveDocument();

    DocumentPage.clickSpatialEntry('reference, wkt-1');
    DocumentPage.clickLeafletMapResetBtn();

    DocumentPage.clickSpatialEntry('reference, wkt-2');
    DocumentPage.clickLeafletMapResetBtn();
  });

  it('should update a spatial reference (bbox)', () => {
    const docName = 'spatial-' + Utils.randomString();

    DocumentPage.CreateSpatialBboxAndWktEntrysWithAPI(docName, false);
    Tree.openNode(['api-' + docName]);

    DocumentPage.checkSpatialEntryNumber(4);
    enterMcloudDocTestData.openSpatialMenuDoc('Berlin');
    enterMcloudDocTestData.selectChangeInSpatialMenuDoc();

    enterMcloudDocTestData.setOpenedSpatialBbox('update spatial reference, bbox', 'Hamburg');
    // number should stay the same
    DocumentPage.checkSpatialEntryNumber(4);
    DocumentPage.checkSpatialEntryExists('Hamburg');

    // TODO: why save?
    DocumentPage.saveDocument();
  });

  it('should update a spatial reference (WKT)', () => {
    const docName = 'spatial-' + Utils.randomString();
    const poly = 'POLYGON((10 5, 1 6, 1 7, 2 1, 3 5)(8 5, 5 7, 2 7, 3 5, 5 8))';

    DocumentPage.CreateSpatialBboxAndWktEntrysWithAPI(docName, false);
    Tree.openNode(['api-' + docName]);

    enterMcloudDocTestData.openSpatialMenuDoc('reference, wkt-1');
    enterMcloudDocTestData.selectChangeInSpatialMenuDoc();

    enterMcloudDocTestData.setOpenedSpatialWKT('update spatial reference, wkt', poly);
    DocumentPage.checkSpatialEntryNumber(4);
    DocumentPage.checkSpatialEntryExists('update spatial reference, wkt');

    // TODO: why save?
    DocumentPage.saveDocument();
  });

  it('should remove spatial references', () => {
    const docName = 'spatialToDelete-' + Utils.randomString();

    DocumentPage.CreateSpatialBboxAndWktEntrysWithAPI(docName, false);
    Tree.openNode(['api-' + docName]);

    // delete a bbox entry
    enterMcloudDocTestData.openSpatialMenuDoc('Berlin');
    enterMcloudDocTestData.deleteSpatialReference('Berlin');

    DocumentPage.checkSpatialEntryExistsNot('Berlin');

    // delete a wkt entry
    enterMcloudDocTestData.openSpatialMenuDoc('create spatial reference, wkt-1');
    enterMcloudDocTestData.deleteSpatialReference('create spatial reference, wkt-1');

    DocumentPage.checkSpatialEntryExistsNot('create spatial reference, wkt-1');
  });

  xit('should focus on a selected spatial reference and also reset view after pressing reset button', () => {});
});
