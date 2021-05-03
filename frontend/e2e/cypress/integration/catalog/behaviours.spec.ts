import {BehavioursPage} from "../../pages/behaviours.page";

describe('Behaviours', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should show multiple system and form behaviours', () => {
    cy.get(BehavioursPage.CatalogsTabmenu.Codelisten).click();
    cy.get('div.left-side').contains('Katalogspezifische Codelisten');
    cy.get('mat-form-field mat-select').contains('Kategorien');
    BehavioursPage.checkPageContains('ige-catalog-codelists',['Klima und Wetter'] );

    cy.get(BehavioursPage.CatalogsTabmenu.Formulare).click();
    cy.get('div.left-side').contains('Formularkonfiguration');
    BehavioursPage.checkPageContains('ige-behaviour-item',['Publish Plugin'] );
  });

  describe('System', () => {
    xit('should change the session timeout behaviour', () => {});

    xit('should change the sorting of the tree', () => {});

    xit('should change the template for the address generation', () => {});
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
