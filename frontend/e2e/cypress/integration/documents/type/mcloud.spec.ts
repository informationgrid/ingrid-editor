import { DocumentPage, PublishOptions } from '../../../pages/document.page';
import { AddressPage } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { Menu } from '../../../pages/menu';
import { Utils } from '../../../pages/utils';
import { AdminUserPage } from '../../../pages/administration-user.page';

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
      cy.get(DocumentPage.Toolbar.PublishNow).click();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      // should show exactly 6 validation errors on the following fields
      cy.containsFormErrors(5);

      // TODO: check all necessary fields!
      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });

    it('should create a minimal publishable document', () => {
      const docName = 'mCloudDoc1';

      DocumentPage.createDocument(docName);

      enterMcloudDocTestData.enterNecessaryData();

      DocumentPage.publishNow();
    });

    it('after adding address to document, the document can not be accessed anymore by users not authorized to access address', () => {
      // add address to document
      DocumentPage.visit();
      Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3D', 'Datum_Ebene_4_8']);
      enterMcloudDocTestData.setAddress('Normandie, Adresse');
      DocumentPage.saveDocument();
      // log in as user with limited access rights and check access
      cy.kcLogout();
      cy.kcLogin('meta2');
      DocumentPage.visit();
      // open folder containing document in question
      Tree.openNode(['Ordner_Ebene_2C', 'Ordner_Ebene_3D']);
      // try to open document
      cy.contains('mat-tree-node', 'Datum_Ebene_4_8').click();
      // expect error
      cy.get('.error').should('exist');
      cy.contains('mat-dialog-content', 'Der Datensatz enthält Referenzen, auf die Sie keine Berechtigungen haben');
    });

    it('should not be able to choose address folder as address', () => {
      const addressName = 'testordner_1';
      const docName = 'mCloudfullDoc1';

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      cy.get(DocumentPage.Sidemenu.Skalieren).click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      enterMcloudDocTestData.checkAddressSelectable(addressName, false);
    });

    it('should create a complete mcloud document', () => {
      const docName = 'mCloudfullDoc' + Utils.randomString();
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      //cy.get(DocumentPage.Sidemenu.Skalieren).click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      enterMcloudDocTestData.setDescription('some meaningful description');
      enterMcloudDocTestData.setAddress(PUBLISHED_ADDRESS);
      enterMcloudDocTestData.setUsageInstructions('Nutzerhinweise');
      enterMcloudDocTestData.setCategory('Bahn');
      enterMcloudDocTestData.setOpenDataCategory('Verkehr');
      enterMcloudDocTestData.setAddDownload();
      enterMcloudDocTestData.setLicense('Andere offene Lizenz');
      enterMcloudDocTestData.setSourceNote('Meine Quelle');
      enterMcloudDocTestData.setMfund('text1', 'text2');
      enterMcloudDocTestData.setSpatialWKT();
      enterMcloudDocTestData.setTimeReference(new Date(2020, 1, 11), 'Erstellung');
      enterMcloudDocTestData.setPeriodOfTime('von - bis', previousDate, dateNow);
      enterMcloudDocTestData.setPeriodicity('einmalig');

      // needed to slow it down
      cy.get('[data-cy=Periodizität').find('mat-form-field').should('have.text', 'einmalig');

      DocumentPage.saveDocument();
    });

    it('should check if "Zeitspanne" dropdown contains an option ', () => {
      const docName = 'mCloudfullDoc1' + Utils.randomString();
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);
      const option = '';

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      cy.get('[data-cy="menu-scale"]').click();
      DocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');
      enterMcloudDocTestData.setPeriodOfTime(option, previousDate, dateNow);
      DocumentPage.saveDocument();
      cy.reload();

      enterMcloudDocTestData.checkPeriodOfTimeSelectedValue(option);
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
      enterMcloudDocTestData.setAddress('Pays-Basque, Adresse');
      DocumentPage.saveDocument();
      // try to delete address
      Menu.switchTo('ADDRESSES');
      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_B', 'Ordner_3.Ebene_C', 'Pays-Basque, Adresse']);
      AddressPage.tryIllegitimatDelete();
      // expect warning
      cy.contains('[data-cy="error-dialog-content"]', 'von anderen Datensätzen referenziert');
    });
  });
});
