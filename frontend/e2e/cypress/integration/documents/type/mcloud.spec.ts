import { DocumentPage } from '../../../pages/document.page';
import { AddressPage } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';

describe('mCLOUD documents', function () {
  beforeEach(() => {
    cy.kcLogin('user');
    DocumentPage.visit();
  });

  afterEach(() => {
    cy.kcLogout();
  });

  describe('Publish documents', () => {
    const PUBLISHED_ADDRESS = 'Published Testorganization';

    it('should display a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      DocumentPage.createDocument('New mCLOUD Document');

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      cy.get('[data-cy=toolbar_publish_now]').click();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      // should show exactly 6 validation errors on the following fields
      cy.containsFormErrors(6);

      // TODO: check all necessary fields!
      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });

    it('should create a minimal publishable document', () => {
      const docName = 'mCloudDoc1';

      DocumentPage.createDocument(docName);

      enterMcloudDocTestData.enterNecessaryData();

      DocumentPage.publishNow();
    });

    it('should create a complete mcloud document', () => {
      const docName = 'mCloudfullDoc1';
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      cy.get(DocumentPage.Sidemenu.Skalieren).click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      enterMcloudDocTestData.setDescription();
      enterMcloudDocTestData.setAddress(PUBLISHED_ADDRESS);
      enterMcloudDocTestData.setUsageInstructions();
      enterMcloudDocTestData.setCategory();
      enterMcloudDocTestData.setOpenDataCategory();
      enterMcloudDocTestData.setAddDownload();
      enterMcloudDocTestData.setLicense();
      enterMcloudDocTestData.setSourceNote();
      enterMcloudDocTestData.setMfund();
      enterMcloudDocTestData.setSpatialWKT();
      enterMcloudDocTestData.setTimeReference();
      enterMcloudDocTestData.setPeriodOfTime('von - bis', previousDate, dateNow);
      enterMcloudDocTestData.setPeriodicity();

      // needed to slow it down
      cy.get('[data-cy=Periodizität').find('mat-form-field').should('have.text', 'einmalig');

      DocumentPage.saveDocument();
    });

    it('should create a published address with an API-Call', () => {
      const json = {
        firstName: 'vor',
        lastName: 'nach',
        organization: 'org',
        title: 'APICallPublishedAdr',
        _type: 'AddressDoc',
        contact: [{ type: 1, connection: '0123456789' }]
      };

      DocumentPage.checkURL('/form');
      AddressPage.apiCreateAddress(json, true);

      cy.visit('/address');
      cy.wait(100);
      DocumentPage.checkURL('/address');
      Tree.containsNodeWithObjectTitle('APICallPublishedAdr');
    });
  });
});
