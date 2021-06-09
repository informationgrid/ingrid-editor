import {BehavioursPage} from "../../pages/behaviours.page";
import {DocumentPage} from "../../pages/document.page";
import {Tree} from "../../pages/tree.partial";
import {Address, AddressPage} from "../../pages/address.page";
import {CatalogsTabmenu} from "../../pages/base.page";

describe('Behaviours', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should show multiple system and form behaviours', () => {
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    cy.get('div.left-side').contains('Katalogverhalten');
    cy.get('ige-behaviour-item').should('be.visible');

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
    cy.get('div.left-side').contains('Formularkonfiguration');
    cy.get('ige-behaviour-item').should('be.visible');
  });

  describe('System', () => {
    it('should change the session timeout behaviour', () => {
      BehavioursPage.checkTimeoutIs('30');
      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSettingInput('Session Timeout Dauer','600');
      BehavioursPage.checkTimeoutIs('10');
      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSetting('Session Timeout Dauer', false);
      BehavioursPage.checkTimeoutIs('30');
    });

    it('should change the sorting of the tree', () => {
      const firstDoc = 'AAA_testDocForSortingCheck_API';
      const lastDoc = 'ZZZ_mCloudDocForSortingCheck_API';

      cy.get(DocumentPage.Sidemenu.Daten).click();
      DocumentPage.CreateTestDocumentWithAPI(firstDoc, false);
      DocumentPage.CreateFullMcloudDocumentWithAPI(lastDoc, false);

      Tree.openNode(['Neue Testdokumente', lastDoc]);
      cy.get('[data-mat-icon-name="Fachaufgabe"]').should('be.visible');
      Tree.selectNodeAndCheckPath(firstDoc, ['Daten', 'Neue Testdokumente']);
      cy.get('[data-mat-icon-name="Geodatendienst"]').should('be.visible');
      // check first element contains AAA before changing sorting of the tree
      cy.get('mat-tree-node> div > span').first().contains(firstDoc);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSetting('Sortierung des Baums nach Dokumententyp', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode(['Neue Testdokumente',lastDoc]);
      // check first element contains ZZZ after changing sorting of the tree
      cy.get('mat-tree-node> div > span').first().contains(lastDoc);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSetting('Sortierung des Baums nach Dokumententyp', false);
    });

    it('should change the template for the address generation', () => {
      const firstName = 'Thomason';
      const firstName2 = 'Nosamoht';
      const lastName = 'Schoofin';
      const lastName2 = 'Nifoohcs';
      const organizationName = 'Sportclub';
      const organizationName2 = 'Bulctrops';

      cy.get(DocumentPage.Sidemenu.Adressen).click();
      AddressPage.createAddress(new Address(firstName, lastName, organizationName));
      cy.get(DocumentPage.title).should('have.text',organizationName + ', ' + lastName + ', ' + firstName);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSettingInput('Template für die Generierung des Adressen-Titels','firstName');

      cy.get(DocumentPage.Sidemenu.Adressen).click();
      AddressPage.createAddress(new Address(firstName2, lastName2, organizationName2));
      cy.get(DocumentPage.title).should('have.text', firstName2).should('not.contain', organizationName2 + ', ' + lastName2);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten)
      BehavioursPage.setCatalogSetting('Template für die Generierung des Adressen-Titels', false);
    });
  });

  describe('Form', () => {
    it('should toggle the JSON view of a document', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SHOW_JSON]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Anzeige JSON Formular',true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SHOW_JSON]').should('be.visible');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Anzeige JSON Formular', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SHOW_JSON]').should('not.exist');
      cy.get('as-split-area'[2]).should('not.exist');
    });

    it('should show and hide the publish button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_publish_now]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Publish Plugin',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_publish_now]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Publish Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_publish_now]').should('exist');
    });

    it('should show and hide the new document button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_NEW_DOC]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Neues Dokument Plugin',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_NEW_DOC]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Neues Dokument Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_NEW_DOC]').should('exist');
    });

    it('should show and hide the save button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SAVE]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Save Plugin',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SAVE]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Save Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SAVE]').should('exist');
    });

    it('should show and hide the create folder button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_CREATE_FOLDER]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Folder Plugin',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_CREATE_FOLDER]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Folder Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_CREATE_FOLDER]').should('exist');
    });

    it('should show and hide the copy/cut button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_COPY]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Copy Cut Paste',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_COPY]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Copy Cut Paste', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_COPY]').should('exist');
    });

    it('should show and hide the delete doc/folder button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_DELETE]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Delete Docs Plugin',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_DELETE]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Delete Docs Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_DELETE]').should('exist');
    });

    xit('should jump back to a previously opened document via history buttons', () => {
      // also test if button disappears when behaviour disabled
      // open 3 documents after another
      // check if forward button is disabled and backward button enabled and doc 3 is opened
      // go backwards -> forward and backward buttons are enabled and doc 2 is opened
      // go backwards -> forward button is enabled and backward button is disabled and doc 1 is opened
      // go forward -> forward and backward buttons are enabled and doc 2 is opened
      // go forward -> forward button is disabled and backward button enabled and doc 3 is opened
    });

    it('should be only possible to delete non empty folders if behaviour is switched off', () => {
      const node = 'Testdokumente';

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode([node]);
      Tree.checkNodeHasChildren(node);
      cy.get(DocumentPage.Toolbar['Delete']).click();
      cy.get('[data-cy=error-dialog-content]').contains('Um Ordner zu löschen, müssen diese leer sein')
      cy.get('[data-cy=error-dialog-close]').click();

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Nur leere Ordner löschen',false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode([node]);
      Tree.checkNodeHasChildren(node);
      cy.get(DocumentPage.Toolbar['Delete']).click();
      cy.get('[data-cy=error-dialog-content]').should('not.exist')
      cy.get('[data-cy=confirm-dialog-cancel]').click();

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare)
      BehavioursPage.setCatalogSetting('Nur leere Ordner löschen',true);
    });
  });
});
