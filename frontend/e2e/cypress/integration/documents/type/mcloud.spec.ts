import {DocumentPage} from '../../../pages/document.page';
import {AddressPage} from "../../../pages/address.page";
import {Tree} from "../../../pages/tree.partial";
import {enterTestDataSteps} from "../../../pages/enterTestDataSteps";

describe('mCLOUD documents', function () {

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  beforeEach(() => {
    DocumentPage.visit();
  });

  describe('Publish documents', () => {
    const PUBLISHED_ADDRESS = 'Published Testorga';

    it('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      DocumentPage.createDocument();

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      cy.get('[data-cy=toolbar_publish_now]').click();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      // should show exactly x validation errors on the following fields

      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });

    it('should create a minimal publishable document', () => {
      const docName = 'mCloudDoc1';

      cy.visit('/address')
      AddressPage.createAddressAndPublish(PUBLISHED_ADDRESS,'E-Mail');

      cy.visit('form')
      DocumentPage.createDocument(docName);
      // cy.visit('/form;id=642b8dde-96a9-4b1f-a2eb-e8894735f4cd');

      enterTestDataSteps.setMcloudDescription();
      enterTestDataSteps.setMcloudAddress(PUBLISHED_ADDRESS);
      enterTestDataSteps.setMcloudCategory();
      enterTestDataSteps.setMcloudOpenDataCategory();
      enterTestDataSteps.setMcloudAddDownload();
      enterTestDataSteps.setMcloudLicense();
      enterTestDataSteps.setMcloudTimeReference();

      //needed to slow it down
      cy.get('[data-cy="Zeitbezug der Ressource"]').find('mat-form-field').contains('Datum');
      cy.wait(500);

      DocumentPage.publishNow();
    });

    it('should create a complete mcloud document', () => {
      const docName = 'mCloudfullDoc1';

      DocumentPage.createDocument(docName);

      //check if created document is a mCloud-Document
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
      enterTestDataSteps.setMcloudPeriodOfTime();
      enterTestDataSteps.setMcloudPeriodicity();

      //needed to slow it down
      cy.get('[data-cy=Periodizität').find('mat-form-field').should('have.text', 'einmalig');
      cy.wait(500);

      DocumentPage.saveDocument();
    });

  });
});
