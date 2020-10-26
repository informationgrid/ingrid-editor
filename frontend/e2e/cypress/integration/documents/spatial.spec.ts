import {enterMcloudDocTestData} from "../../pages/enterMcloudDocTestData";
import {DocumentPage} from "../../pages/document.page";
import {Utils} from "../../pages/utils";

describe('Spatial References', () => {

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  beforeEach(() => {
    DocumentPage.visit();
  });

  it('should create a new spatial reference (bbox)', () => {
    const docName = 'spatialbbox-' + Utils.randomString()

    DocumentPage.createDocument(docName);
    enterMcloudDocTestData.setSpatialBbox('create spatial reference, bbox', 'Bremen');
    DocumentPage.checkSpatialEntryExists('Bremen');

    DocumentPage.saveDocument();
  });

  it('should create a new spatial reference (WKT)', () => {
    const docName = 'spatialwkt-' + Utils.randomString()
    const poly = 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))'

    DocumentPage.createDocument(docName);
    enterMcloudDocTestData.setSpatialWKT('create spatial reference, wkt-1', poly);
    DocumentPage.checkSpatialEntryExists('reference, wkt-1');

    DocumentPage.saveDocument();
  });

  it('should add additional a spatial reference (bbox)', () => {
    // TODO: this test should not depend on other test 'should create a new spatial reference (bbox)'
    //       if another document with this this name exists, then this test breaks
    DocumentPage.getDocument('bbox');

    enterMcloudDocTestData.setSpatialBbox('add spatial reference, bbox', 'Berlin');

    DocumentPage.checkSpatialEntryExists('Berlin');

    DocumentPage.saveDocument();

    DocumentPage.clickSpatialEntry('Berlin');
    DocumentPage.clickLeafletMapResetBtn();

    DocumentPage.clickSpatialEntry('Bremen');
    DocumentPage.clickLeafletMapResetBtn();
  });

  it('should add additional a spatial reference (WKT)', () => {
    const poly = 'POLYGON((1 5, 5 9, 1 7, 2 1, 3 5)(5 5, 5 7, 7 7, 7 5, 5 5))'

    // TODO: this test should not depend on other test
    DocumentPage.getDocument('wkt');

    enterMcloudDocTestData.setSpatialWKT('add spatial reference, wkt-2', poly);
    DocumentPage.checkSpatialEntryExists('reference, wkt-2');

    DocumentPage.saveDocument();

    DocumentPage.clickSpatialEntry('reference, wkt-1');
    DocumentPage.clickLeafletMapResetBtn();

    DocumentPage.clickSpatialEntry('reference, wkt-2');
    DocumentPage.clickLeafletMapResetBtn();
  });

  it('should update a spatial reference (bbox)', () => {
    // TODO: this test should not depend on other test
    DocumentPage.getDocument('bbox');

    enterMcloudDocTestData.openSpatialMenuDoc('Berlin');
    enterMcloudDocTestData.selectChangeInSpatialMenuDoc();

    enterMcloudDocTestData.setOpenedSpatialBbox('update spatial reference, bbox', 'Hamburg');
    DocumentPage.checkSpatialEntryExists('Hamburg');

    DocumentPage.saveDocument();
  });

  xit('should update a spatial reference (WKT)', () => {

  });

  it('should remove spatial references', () => {
    // TODO: this test should not depend on other test
    DocumentPage.getDocument('bbox');

    enterMcloudDocTestData.openSpatialMenuDoc('Hamburg');
    enterMcloudDocTestData.deleteSpatialReference('Hamburg');

    DocumentPage.checkSpatialEntryExistsNot('Hamburg');
  });

  xit('should focus on a selected spatial reference and also reset view after pressing reset button', () => {

  });

});
