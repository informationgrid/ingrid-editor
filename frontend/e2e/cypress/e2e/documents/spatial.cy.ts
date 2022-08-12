import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';
import { DocumentPage } from '../../pages/document.page';
import { Utils } from '../../pages/utils';
import { Tree } from '../../pages/tree.partial';
import { AddressPage } from '../../pages/address.page';

describe('Spatial References', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    DocumentPage.visit();
  });

  it('should create a new spatial reference (bbox)', () => {
    const docName = 'spatialbbox-' + Utils.randomString();

    DocumentPage.createDocument(docName);
    enterMcloudDocTestData.setSpatialBbox('create spatial reference, bbox', 'Bremen');
    DocumentPage.checkSpatialEntryNumber(1);
    DocumentPage.checkSpatialEntryExists('Bremen');
  });

  it('should create a new spatial reference (WKT)', () => {
    const docName = 'spatialwkt-' + Utils.randomString();
    const poly = 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))';

    DocumentPage.createDocument(docName);
    enterMcloudDocTestData.setSpatialWKT('create spatial reference, wkt-1', poly);
    DocumentPage.checkSpatialEntryNumber(1);
    DocumentPage.checkSpatialEntryExists('reference, wkt-1');
  });

  it('should add additional a spatial reference (bbox)', () => {
    const docNameBbox = 'spatialbbox-' + Utils.randomString();

    DocumentPage.CreateSpatialBboxWithAPI(docNameBbox, false);
    // give the application time to show the api-created document
    AddressPage.visit();
    DocumentPage.visit();
    Tree.openNode(['api-' + docNameBbox]);

    enterMcloudDocTestData.setSpatialBbox('add spatial reference, bbox', 'Berlin');
    DocumentPage.checkSpatialEntryNumber(2);
    DocumentPage.checkSpatialEntryExists('Berlin');
  });

  it('should add additional a spatial reference (WKT)', () => {
    const poly = 'POLYGON((1 5, 5 9, 1 7, 2 1, 3 5)(5 5, 5 7, 7 7, 7 5, 5 5))';
    const docNameBbox = 'spatialwkt-' + Utils.randomString();

    // create new document
    DocumentPage.CreateSpatialWKTWithAPI(docNameBbox, false);
    // reload page to see added document in tree
    cy.pageReload('dashboard-docs-header', 'Daten');
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
    // reload page to see new Document
    DocumentPage.visit();
    Tree.openNode(['api-' + docName]);

    DocumentPage.checkSpatialEntryNumber(4);
    enterMcloudDocTestData.openSpatialMenuDoc('Berlin');
    enterMcloudDocTestData.selectChangeInSpatialMenuDoc();

    enterMcloudDocTestData.setOpenedSpatialBbox('update spatial reference, bbox', 'Hamburg');
    // number should stay the same
    DocumentPage.checkSpatialEntryNumber(4);
    DocumentPage.checkSpatialEntryExists('Hamburg');
  });

  it('should update a spatial reference (WKT)', () => {
    const docName = 'spatial-' + Utils.randomString();
    const poly = 'POLYGON((10 5, 1 6, 1 7, 2 1, 3 5)(8 5, 5 7, 2 7, 3 5, 5 8))';

    DocumentPage.CreateSpatialBboxAndWktEntrysWithAPI(docName, false);
    cy.wait(1000);
    DocumentPage.visit();
    Tree.openNode(['api-' + docName]);

    enterMcloudDocTestData.openSpatialMenuDoc('reference, wkt-1');
    enterMcloudDocTestData.selectChangeInSpatialMenuDoc();

    enterMcloudDocTestData.setOpenedSpatialWKT('update spatial reference, wkt', poly);
    DocumentPage.checkSpatialEntryNumber(4);
    DocumentPage.checkSpatialEntryExists('update spatial reference, wkt');
  });

  it('should remove spatial references', () => {
    const docName = 'spatialToDelete-' + Utils.randomString();

    DocumentPage.CreateSpatialBboxAndWktEntrysWithAPI(docName, false);
    // give application time to show the api-created document
    AddressPage.visit();
    DocumentPage.visit();
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

  it('should focus on a selected spatial reference and also reset view after pressing reset button', () => {
    // open document and navigate to spatial section

    const poly =
      'POLYGON((12.021484375000004 53.70149003298709,12.636718750000004 53.70149003298709,12.636718750000004 53.38814746772829,12.021484375000004 53.38814746772829,12.021484375000004 53.70149003298709))';
    const docNameBbox = 'TestDocResearch1';

    Tree.openNode([docNameBbox]);

    enterMcloudDocTestData.setSpatialWKT('create spatial reference, random', poly);
    DocumentPage.checkSpatialEntryNumber(2);
    DocumentPage.checkSpatialEntryExists('reference, random');

    cy.get('.navigation-header').contains('Raumbezüge').click();
    cy.get('[data-cy="spatialButton"]', { timeout: 1000 }).should('be.visible');

    // click on first Raumbezug
    cy.get('ige-spatial-list mat-list > mat-list-item', { timeout: 1000 }).eq(0).click();

    // make sure that only the first one is visible
    cy.get('path.leaflet-interactive:nth-of-type(2)', { timeout: 1000 }).should('be.visible');
    DocumentPage.clickLeafletMapResetBtn();
    //  make sure that all others are visible
    cy.get('path.leaflet-interactive:nth-of-type(2)', { timeout: 1000 }).should('be.visible');
    cy.get('path.leaflet-interactive:nth-of-type(1)', { timeout: 1000 }).should('be.visible');
  });
});
