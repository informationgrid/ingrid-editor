import { DocumentPage } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Address, AddressPage } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { BehavioursPage } from '../../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../../pages/base.page';
import { Menu } from '../../../pages/menu';

describe('addresses inside test catalogue', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('ige3').as('tokens');
    cy.visit('/form');
    cy.get('mat-toolbar').should('be.visible');
  });

  it('should create a new address inside catalogue of type test', () => {
    const firstName = 'Michael' + Utils.randomString();
    const lastName = 'Meier';
    const title = `${lastName}, ${firstName}`;

    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fill(new Address('', firstName, lastName), ['Adressen'], true);
    cy.contains('button', 'Anlegen').click();
    cy.contains('ige-tree', title);
    cy.contains('.title', title);
  });

  it('should allow creation of address inside test catalogue when various parameters provided', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    cy.get('[data-cy=create-action]').should('be.disabled');

    AddressPage.CreateDialog.fill(new Address('', 'firstName' + Utils.randomString()), [], true);
    cy.get('[data-cy=create-action]').should('be.disabled');

    AddressPage.CreateDialog.fill(new Address('', '', 'lastName' + Utils.randomString()), [], true);
    cy.get('[data-cy=create-action]').should('be.enabled');

    AddressPage.CreateDialog.fill(new Address('', '', ''), [], true);
    cy.get('[data-cy=create-action]').should('be.disabled');
  });

  it('should add and remove address to document of type test', () => {
    // add address
    Tree.openNode(['Testdokumente', 'Testdokument_1']);
    AddressPage.addAddressToTestDocument(['Testadressen', 'Organisation_30, Nachname30, Name30'], 'Ansprechpartner');
    AddressPage.saveDocument();
    // verify address has been added
    cy.contains('ige-address-card mat-card-header', 'Ansprechpartner');
    cy.contains('ige-address-card mat-card-content', 'Organisation_30 Name30 Nachname30');
    // remove address
    AddressPage.deleteAddressFromTestDocument();
    AddressPage.saveDocument();
    cy.get('ige-address-card').should('not.exist');
  });

  it('should test sorting of the tree inside catalogue of type test', () => {
    const firstDoc = 'Datum_Ebene_4_1';
    const lastDoc = 'Datum_Ebene_4_2';

    cy.get(DocumentPage.Sidemenu.Daten).click();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', lastDoc]);
    cy.get('[data-mat-icon-name="Fachaufgabe"]').should('be.visible');
    Tree.selectNodeAndCheckPath(firstDoc, ['Daten', 'Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A']);
    cy.get('[data-mat-icon-name="Geodatendienst"]').should('be.visible');
    // check order of documents
    cy.get('mat-tree-node > div > div > span:nth-child(2)').eq(0).contains(firstDoc);
    cy.get('mat-tree-node > div > div > span:nth-child(2)').eq(1).contains(lastDoc);
    // change sorting of the tree
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    BehavioursPage.setCatalogSetting('Sortierung des Baums nach Dokumententyp', true);
    // check new order of the tree
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', lastDoc]);
    cy.get('mat-tree-node > div > div > span:nth-child(2)').eq(1).contains(firstDoc);
    cy.get('mat-tree-node > div > div > span:nth-child(2)').eq(0).contains(lastDoc);
    // toggle button to original state
    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Katalogverhalten);
    BehavioursPage.setCatalogSetting('Sortierung des Baums nach Dokumententyp', false);
  });

  it('should create an address via api for the test catalogue', () => {
    const addressFirstName = 'firstName' + Utils.randomString();
    const addressLastName = 'firstName' + Utils.randomString();
    const addressData = {
      firstName: addressFirstName,
      lastName: addressLastName,
      organization: 'org',
      title: 'org, ' + addressLastName + ', ' + addressFirstName,
      _type: 'AddressDoc',
      contact: [{ type: 1, connection: '0123456789' }]
    };
    AddressPage.apiCreateAddress(addressData, false);
    // check title of new address
    AddressPage.visit();
    Tree.openNode([addressData.title]);
    cy.get(DocumentPage.title).should('have.text', addressData.title);
  });
});
