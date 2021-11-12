import { BehavioursPage } from '../../pages/behaviours.page';
import { DocumentPage } from '../../pages/document.page';
import { Tree } from '../../pages/tree.partial';
import { Address, AddressPage } from '../../pages/address.page';
import { CatalogsTabmenu } from '../../pages/base.page';

describe('Behaviours', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user').as('tokens');
    cy.visit('catalogs');
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
      // check second element contains AAA before changing sorting of the tree
      cy.get('mat-tree-node> div > span:nth-child(2)').contains(firstDoc);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSetting('Sortierung des Baums nach Dokumententyp', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode(['Neue Testdokumente', lastDoc]);
      // check second element contains ZZZ after changing sorting of the tree
      cy.get('mat-tree-node> div > span:nth-child(2)').contains(lastDoc);

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
      cy.get(DocumentPage.title).should('have.text', organizationName + ', ' + lastName + ', ' + firstName);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSettingInput('Template für die Generierung des Adressen-Titels', 'firstName');

      cy.get(DocumentPage.Sidemenu.Adressen).click();
      cy.intercept('GET', /api\/datasets\/[0-9a-z-]+\?address=false/).as('setAddress');
      AddressPage.createAddress(new Address(firstName2, lastName2, organizationName2));
      cy.wait('@setAddress');

      cy.get(DocumentPage.title)
        .should('have.text', firstName2)
        .should('not.contain', organizationName2 + ', ' + lastName2);

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
      BehavioursPage.setCatalogSetting('Template für die Generierung des Adressen-Titels', false);
    });
  });

  describe('Form', () => {
    it('should toggle the JSON view of a document', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SHOW_JSON]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Anzeige JSON Formular', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SHOW_JSON]').should('be.visible');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Anzeige JSON Formular', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_SHOW_JSON]').should('not.exist');
      cy.get('as-split-area'[2]).should('not.exist');
    });

    it('should show and hide the publish button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_publish_now]').should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Publish Plugin', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_publish_now]').should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Publish Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_publish_now]').should('exist');
    });

    it('should show and hide the new document button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.NewDoc).should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Neues Dokument Plugin', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.NewDoc).should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Neues Dokument Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get('[data-cy=toolbar_NEW_DOC]').should('exist');
    });

    it('should show and hide the save button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Save).should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Save Plugin', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Save).should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Save Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Save).should('exist');
    });

    it('should show and hide the create folder button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.NewFolder).should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Folder Plugin', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.NewFolder).should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Folder Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.NewFolder).should('exist');
    });

    it('should show and hide the copy/cut button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Copy).should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Copy Cut Paste', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Copy).should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Copy Cut Paste', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Copy).should('exist');
    });

    it('should show and hide the delete doc/folder button', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Delete).should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Delete Docs Plugin', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Delete).should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Delete Docs Plugin', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Delete).should('exist');
    });

    it('should show and hide the history buttons', () => {
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Previous).should('exist');
      cy.get(DocumentPage.Toolbar.Next).should('exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('History Plugin', false);

      // check button disappears when behaviour disabled
      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.get(DocumentPage.Toolbar.Previous).should('not.exist');
      cy.get(DocumentPage.Toolbar.Next).should('not.exist');

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('History Plugin', true);
    });

    it('should jump back to a previously opened document via history buttons', () => {
      const firstObject = 'Testdokumente';
      const secondObject = 'Ordner 2. Ebene';
      const thirdObject = 'Tiefes Dokument';

      cy.get(DocumentPage.Sidemenu.Daten).click();

      // open 3 documents after another
      Tree.clickOnNodeWithTitle(firstObject);
      Tree.clickOnNodeWithTitle(secondObject);
      Tree.clickOnNodeWithTitle(thirdObject);

      // check if forward button is disabled and backward button enabled and doc 3 is opened
      cy.get(DocumentPage.Toolbar.Next).should('be.disabled');
      cy.get(DocumentPage.Toolbar.Previous).should('be.enabled');
      cy.get(DocumentPage.title).should('have.text', thirdObject);

      // go backwards -> forward and backward buttons are enabled and doc 2 is opened
      Tree.goBack();
      Tree.goForward();
      Tree.goBack();
      cy.get(DocumentPage.title).contains(secondObject);

      // go backwards -> forward button is enabled and backward button is disabled and doc 1 is opened
      Tree.goBack();
      cy.get(DocumentPage.Toolbar.Next).should('be.enabled');
      cy.get(DocumentPage.Toolbar.Previous).should('be.disabled');
      cy.get(DocumentPage.title).contains(firstObject);

      // go forward -> forward and backward buttons are enabled and doc 2 is opened
      Tree.goForward();
      Tree.goForward();
      Tree.goBack();
      cy.get(DocumentPage.title).contains(secondObject);

      // go forward -> forward button is disabled and backward button enabled and doc 3 is opened
      Tree.goForward();
      cy.get(DocumentPage.Toolbar.Next).should('be.disabled');
      cy.get(DocumentPage.Toolbar.Previous).should('be.enabled');
      cy.get(DocumentPage.title).contains(thirdObject);
    });

    it('should be only possible to delete non empty folders if behaviour is switched off', () => {
      const node = 'Testdokumente';

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode([node]);
      Tree.checkNodeHasChildren(node);
      cy.get(DocumentPage.Toolbar['Delete']).click();
      cy.get('[data-cy=error-dialog-content]').contains('Um Ordner zu löschen, müssen diese leer sein');
      cy.get('[data-cy=error-dialog-close]').click();

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Nur leere Ordner löschen', false);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode([node]);
      Tree.checkNodeHasChildren(node);
      cy.get(DocumentPage.Toolbar['Delete']).click();
      cy.get('[data-cy=error-dialog-content]').should('not.exist');
      cy.get('[data-cy=confirm-dialog-cancel]').click();

      BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Formulare);
      BehavioursPage.setCatalogSetting('Nur leere Ordner löschen', true);
    });
  });
});
