import {BehavioursPage} from "../../pages/behaviours.page";
import {DocumentPage} from "../../pages/document.page";
import {Tree} from "../../pages/tree.partial";
import {Address, AddressPage} from "../../pages/address.page";

describe('Behaviours', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should show multiple system and form behaviours', () => {
    cy.get(BehavioursPage.CatalogsTabmenu.Katalogverhalten).click();
    cy.get('div.left-side').contains('Katalogverhalten');
    cy.get('ige-behaviour-item').should('be.visible');

    cy.get(BehavioursPage.CatalogsTabmenu.Formulare).click();
    cy.get('div.left-side').contains('Formularkonfiguration');
    cy.get('ige-behaviour-item').should('be.visible');
  });

  describe('System', () => {
    it('should change the session timeout behaviour', () => {
      cy.get(BehavioursPage.CatalogsTabmenu.Katalogverhalten).click();
      BehavioursPage.checkTimeoutIs('30');
      BehavioursPage.setInputAndSaveCatalogSettings('Session Timeout Dauer','600');
      BehavioursPage.checkTimeoutIs('10');
      BehavioursPage.turnOffCatalogSettingAndSave('Session Timeout Dauer');
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

      BehavioursPage.setAndSaveCatalogSettings('Sortierung des Baums nach Dokumententyp', true);

      cy.get(DocumentPage.Sidemenu.Daten).click();
      Tree.openNode(['Neue Testdokumente',lastDoc]);
      // check first element contains ZZZ after changing sorting of the tree
      cy.get('mat-tree-node> div > span').first().contains(lastDoc);

      BehavioursPage.setAndSaveCatalogSettings('Sortierung des Baums nach Dokumententyp', false);
    });

    it('should change the template for the address generation', () => {
      cy.get(DocumentPage.Sidemenu.Adressen).click();
      AddressPage.createAddress(new Address('vor', 'nach', 'org'));
      cy.get(DocumentPage.title).contains('org, nach, vor');

      cy.get(DocumentPage.Sidemenu.Katalogverwaltung).click();
      cy.get(BehavioursPage.CatalogsTabmenu.Katalogverhalten).click();
      BehavioursPage.setInputAndSaveCatalogSettings('Template für die Generierung des Adressen-Titels','firstName');

      cy.get(DocumentPage.Sidemenu.Adressen).click();
      cy.get('ige-sidebar').contains('vor').click();
      cy.get(DocumentPage.title).contains('vor').should('not.contain', 'org, nach');

      cy.get(DocumentPage.Sidemenu.Katalogverwaltung).click();
      cy.get(BehavioursPage.CatalogsTabmenu.Katalogverhalten).click();
      BehavioursPage.turnOffCatalogSettingAndSave('Template für die Generierung des Adressen-Titels');
    });
  });

  describe('Form', () => {
    xit('should toggle the JSON view of a document', () => {
      // also test if button disappears when behaviour disabled
    });

    xit('should show and hide the publish button', () => {
      // behaviour is already tested in other tests
      // so only test toolbar button appearance
    });

    xit('should show and hide the new document button', () => {
      // behaviour is already tested in other tests
      // so only test toolbar button appearance
    });

    xit('should show and hide the save button', () => {
      // behaviour is already tested in other tests
      // so only test toolbar button appearance
    });

    xit('should show and hide the create folder button', () => {
      // behaviour is already tested in other tests
      // so only test toolbar button appearance
    });

    xit('should show and hide the copy/cut button', () => {
      // behaviour is already tested in other tests
      // so only test toolbar button appearance
    });

    xit('should show and hide the delete doc/folder button', () => {
      // behaviour is already tested in other tests
      // so only test toolbar button appearance
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

    xit('should be only possible to delete non empty folders if behaviour is switched off', () => {});
  });
});
