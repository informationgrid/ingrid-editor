import {DocumentPage} from '../../../pages/document.page';
import {AddressPage} from '../../../pages/address.page';
import {Tree} from '../../../pages/tree.partial';
import {enterTestDataSteps} from '../../../pages/enterTestDataSteps';

describe('mCLOUD documents', function () {

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  beforeEach(() => {
    DocumentPage.visit();
  });

  describe('Publish documents', () => {
    const PUBLISHED_ADDRESS = 'Published Testorganization';

    it('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      DocumentPage.createDocument();

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

      enterTestDataSteps.setMcloudDescription();
      enterTestDataSteps.setMcloudAddress(PUBLISHED_ADDRESS);
      enterTestDataSteps.setMcloudCategory();
      enterTestDataSteps.setMcloudOpenDataCategory();
      enterTestDataSteps.setMcloudAddDownload();
      enterTestDataSteps.setMcloudLicense();

      DocumentPage.publishNow();
    });

    it('should create a complete mcloud document', () => {
      const docName = 'mCloudfullDoc1';
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);

      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      enterTestDataSteps.setMcloudDescription();
      enterTestDataSteps.setMcloudAddress(PUBLISHED_ADDRESS);
      enterTestDataSteps.setMcloudUsageInstructions();
      enterTestDataSteps.setMcloudCategory();
      enterTestDataSteps.setMcloudOpenDataCategory();
      enterTestDataSteps.setMcloudAddDownload();
      enterTestDataSteps.setMcloudLicense();
      enterTestDataSteps.setMcloudSourceNote();
      enterTestDataSteps.setMcloudMfund();
      enterTestDataSteps.setMcloudSpatialWKT();
      enterTestDataSteps.setMcloudTimeReference();
      enterTestDataSteps.setMcloudPeriodOfTime('von - bis', previousDate, dateNow);
      enterTestDataSteps.setMcloudPeriodicity();

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
        contact: [{type: 1, connection: '0123456789'}]
      };

      DocumentPage.checkURL('/form');
      AddressPage.apiCreateAddress(json, true);

      cy.visit('/address');
      DocumentPage.checkURL('/address');
      Tree.containsNodeWithTitle('APICallPublishedAdr');
    });

  });
});
