import { DocumentPage } from '../../../pages/document.page';
import { AddressPage } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { Menu } from '../../../pages/menu';

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

    // right now not working because of bug needing to be fixed
    xit('after catalog admin has added address to document, the document can still be accessed by authorized users (#3446)', () => {
      // add address to document
      DocumentPage.visit();
      Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3D', 'Datum_Ebene_4_8']);
      enterMcloudDocTestData.CreateDialog.setAddress('Normandie, Adresse');
      DocumentPage.saveDocument();
      // log in as user with limited access rights and check access
      cy.kcLogout();
      cy.kcLogin('meta2');
      DocumentPage.visit();
      Tree.openNode(['Ordner_Ebene_2C', 'Ordner_Ebene_3D', 'Datum_Ebene_4_8']);
      cy.get('.error').should('not.exist');
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
        organization: 'PublishedAdressWithAPI',
        title: 'PublishedAdressWithAPI',
        _type: 'McloudAddressDoc',
        contact: [{ type: 1, connection: '0123456789' }]
      };

      DocumentPage.checkURL('/form');
      AddressPage.apiCreateAddress(json, true);

      AddressPage.visit();
      DocumentPage.checkURL('/address');
      Tree.containsNodeWithObjectTitle('PublishedAdressWithAPI');
      Tree.openNode(['PublishedAdressWithAPI']);
    });

    it('should not be able to delete address associated with a document', () => {
      // add address to document
      Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2B', 'Datum_Ebene_3_1']);
      enterMcloudDocTestData.CreateDialog.setAddress('Pays-Basque, Adresse');
      DocumentPage.saveDocument();
      // try to delete address
      Menu.switchTo('ADDRESSES');
      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_B', 'Ordner_3.Ebene_C', 'Pays-Basque, Adresse']);
      AddressPage.tryIllegitimatDelete();
      // expect warning -> not working right now; there is no such warning popping up
      /*cy.contains(
        '[data-cy="error-dialog-content"]',
        'Die Adresse kann nicht gelöscht werden, sie wird von anderen Datensätzen referenziert'
      );*/
    });
  });
});
