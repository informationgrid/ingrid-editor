import { DocumentPage } from '../../../pages/document.page';
import { AddressPage } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';

describe('mCLOUD documents', function () {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user').as('tokens');
    DocumentPage.visit();
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
      cy.containsFormErrors(5);

      // TODO: check all necessary fields!
      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });

    it('should create a minimal publishable document', () => {
      const docName = 'mCloudDoc1';

      DocumentPage.createDocument(docName);

      enterMcloudDocTestData.CreateDialog.enterNecessaryData();

      DocumentPage.publishNow();
    });

    it('should not be able to choose address folder as address', () => {
      const addressName = 'testordner_1';
      const docName = 'mCloudfullDoc1';

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      cy.get(DocumentPage.Sidemenu.Skalieren).click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      enterMcloudDocTestData.CreateDialog.checkAddressSelectable(addressName, false);
    });

    it('should create a complete mcloud document', () => {
      const docName = 'mCloudfullDoc1';
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      //cy.get(DocumentPage.Sidemenu.Skalieren).click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      enterMcloudDocTestData.CreateDialog.setDescription();
      enterMcloudDocTestData.CreateDialog.setAddress(PUBLISHED_ADDRESS);
      enterMcloudDocTestData.CreateDialog.setUsageInstructions();
      enterMcloudDocTestData.CreateDialog.setCategory();
      enterMcloudDocTestData.CreateDialog.setOpenDataCategory();
      enterMcloudDocTestData.CreateDialog.setAddDownload();
      enterMcloudDocTestData.CreateDialog.setLicense();
      enterMcloudDocTestData.CreateDialog.setSourceNote();
      enterMcloudDocTestData.CreateDialog.setMfund();
      enterMcloudDocTestData.CreateDialog.setSpatialWKT();
      enterMcloudDocTestData.CreateDialog.setTimeReference();
      enterMcloudDocTestData.CreateDialog.setPeriodOfTime('von - bis', previousDate, dateNow);
      enterMcloudDocTestData.CreateDialog.setPeriodicity();

      // needed to slow it down
      cy.get('[data-cy=Periodizität').find('mat-form-field').should('have.text', 'einmalig');

      DocumentPage.saveDocument();
    });

    it('should check if "Zeitspanne" dropdown contains an option ', () => {
      const docName = 'mCloudfullDoc1';
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);
      const option = '';

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      cy.get('[data-cy="menu-scale"]').click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');
      enterMcloudDocTestData.CreateDialog.setPeriodOfTime(option, previousDate, dateNow);
      DocumentPage.saveDocument();
      cy.reload();

      enterMcloudDocTestData.CreateDialog.checkPeriodOfTimeSelectedValue(option);
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

      AddressPage.visit();
      DocumentPage.checkURL('/address');
      Tree.containsNodeWithObjectTitle('APICallPublishedAdr');
    });
  });
});
