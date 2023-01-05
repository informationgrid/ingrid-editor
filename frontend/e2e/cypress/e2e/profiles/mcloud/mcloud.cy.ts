import { DocumentPage } from '../../../pages/document.page';
import { AddressPage } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { McloudDocumentPage } from '../../../pages/mcloudDocument.page';
import { Menu } from '../../../pages/menu';
import { Utils } from '../../../pages/utils';

describe('mCLOUD documents', function () {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    McloudDocumentPage.visit();
  });

  describe('Publish documents', () => {
    const PUBLISHED_ADDRESS = 'Published Testorganization';

    it('should display a validation error when a required field is not filled', () => {
      cy.get(McloudDocumentPage.Toolbar.Publish).should('be.disabled');

      McloudDocumentPage.createDocument('New mCLOUD Document');

      cy.get(McloudDocumentPage.Toolbar.Publish).should('be.enabled');
      cy.get(McloudDocumentPage.Toolbar.PublishNow).click();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      // should show exactly 6 validation errors on the following fields
      cy.containsFormErrors(5);

      // TODO: check all necessary fields!
      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });

    it('should create a minimal publishable document', () => {
      const docName = 'mCloudDoc1';

      McloudDocumentPage.createDocument(docName);

      McloudDocumentPage.enterNecessaryData();

      McloudDocumentPage.publishNow();

      // check dashboard for latest published doc
      Menu.switchTo('DASHBOARD', true);
      cy.get('[data-cy="recent-published-docs"] .mat-list-item').first().should('contain', docName);
    });

    it('after adding address to document, the document can not be accessed anymore by users not authorized to access address', () => {
      // add address to document
      McloudDocumentPage.visit();
      Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3D', 'Datum_Ebene_4_8']);
      McloudDocumentPage.setAddress('Normandie, Adresse');
      McloudDocumentPage.saveDocument();
      // log in as user with limited access rights and check access
      cy.logoutClearCookies();
      cy.kcLogin('mcloud-meta-with-groups');
      McloudDocumentPage.visit();
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
      cy.get(McloudDocumentPage.Sidemenu.Skalieren).click();
      McloudDocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      McloudDocumentPage.checkAddressSelectable(addressName, false);
    });

    it('should create a complete mcloud document', () => {
      const docName = 'mCloudfullDoc' + Utils.randomString();
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      //cy.get(DocumentPage.Sidemenu.Skalieren).click();
      McloudDocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');

      McloudDocumentPage.setDescription('some meaningful description');
      McloudDocumentPage.setAddress(PUBLISHED_ADDRESS);
      McloudDocumentPage.fillInFieldWithEnter('[data-cy="keywords"]', 'input', 'schlagwort', '.mat-chip');
      McloudDocumentPage.setUsageInstructions('Nutzerhinweise');
      McloudDocumentPage.setCategory('Bahn');
      McloudDocumentPage.setOpenDataCategory('Verkehr');
      McloudDocumentPage.setAddDownload('someTitle', 'https://docs.cypress.io/api/this');
      McloudDocumentPage.setLicense('Andere offene Lizenz');
      McloudDocumentPage.setSourceNote('Meine Quelle');
      McloudDocumentPage.setMfund('text1', 'text2');
      McloudDocumentPage.setSpatialWKT();
      McloudDocumentPage.setTimeReference(new Date(2020, 1, 11), 'Erstellung');
      McloudDocumentPage.setPeriodOfTime('von - bis', previousDate, dateNow);
      McloudDocumentPage.setPeriodicity('einmalig');

      // needed to slow it down
      cy.get('[data-cy=periodicity').find('mat-form-field').should('have.text', 'einmalig');

      McloudDocumentPage.saveDocument();

      // check if fields contain their values after saving
      cy.get('[data-cy="description"] textarea').should('have.value', 'some meaningful description');
      cy.get('[data-cy="addresses"] ige-address-card').should('contain.text', 'Herausgeber Published Testorganization');
      cy.get('[data-cy="keywords"] .mat-chip').should('contain.text', 'schlagwort');
      cy.get('[data-cy="accessRights"] textarea').should('have.value', 'Nutzerhinweise');
      cy.get('[data-cy="mCloudCategories"] .mat-chip').should('contain.text', 'Bahn');
      cy.get('[data-cy="DCATThemes"] .mat-chip').should('contain.text', 'Verkehr');
      cy.get('[data-cy="Downloads-table"] mat-cell').should('contain.text', 'https://docs.cypress.io/api/this');
      cy.get('[data-cy="license"] input').should('have.value', 'Andere offene Lizenz');
      cy.get('[data-cy="origin"] textarea').should('have.value', 'Meine Quelle');
      cy.get('[data-cy="mFUND"] input').eq(0).should('have.value', 'text1');
      cy.get('[data-cy="mFUND"] input').eq(1).should('have.value', 'text2');
      cy.get('[data-cy="events"] input').should('have.value', '11.01.2020');
      cy.get('[data-cy="temporal"] mat-select').should('contain.text', 'von - bis');
      cy.get('[data-cy="temporal"] input.mat-start-date').should('have.value', '11.01.2020');
      cy.get('[data-cy="temporal"] input.mat-end-date').should('have.value', Utils.getFormattedDate(new Date()));
      cy.get('ige-spatial-list').should('exist');
    });

    it('should check if "Zeitspanne" dropdown contains an option ', () => {
      const docName = 'mCloudfullDoc1' + Utils.randomString();
      const dateNow = new Date();
      const previousDate = new Date(2020, 1, 11);
      const option = '';

      // is needed for setTimeReference, because svgicon='Entfernen' is not in view
      cy.get('[data-cy="menu-scale"]').click();
      McloudDocumentPage.createDocument(docName);

      // check if created document is a mCloud-Document
      cy.get('ige-header-navigation').contains('mCLOUD');
      McloudDocumentPage.setPeriodOfTime(option, previousDate, dateNow);
      McloudDocumentPage.saveDocument();
      cy.pageReload('ige-header-title-row');

      McloudDocumentPage.checkPeriodOfTimeSelectedValue(option);
    });

    it('should create a published address with an API-Call', () => {
      const json = {
        organization: 'PublishedAdressWithAPI',
        title: 'PublishedAdressWithAPI',
        _type: 'McloudAddressDoc',
        contact: [{ type: 1, connection: '0123456789' }]
      };

      McloudDocumentPage.checkURL('/form');
      AddressPage.apiCreateAddress(json, true);

      AddressPage.visit();
      McloudDocumentPage.checkURL('/address');
      Tree.containsNodeWithObjectTitle('PublishedAdressWithAPI');
      Tree.openNode(['PublishedAdressWithAPI']);
    });

    it('should not be able to delete address associated with a document', () => {
      // add address to document
      Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2B', 'Datum_Ebene_3_1']);
      McloudDocumentPage.setAddress('Pays-Basque, Adresse');
      McloudDocumentPage.saveDocument();
      // try to delete address
      Menu.switchTo('ADDRESSES');
      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_B', 'Ordner_3.Ebene_C', 'Pays-Basque, Adresse']);
      AddressPage.tryIllegitimatDelete();
      // expect warning
      cy.contains('ige-replace-address-dialog', 'Diese Adresse wird von mindestens einem Datensatz referenziert');
    });
  });
});
