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
    cy.kcLogin('test-catalog-general-test').as('tokens');
    DocumentPage.visit();
  });

  it('should create a new address inside catalogue of type test', () => {
    const firstName = 'Michael' + Utils.randomString();
    const lastName = 'Meier';
    const title = `${lastName}, ${firstName}`;

    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillPersonType(new Address('', firstName, lastName), ['Adressen']);
    cy.contains('button', 'Anlegen').click();
    cy.contains('ige-tree', title);
    cy.contains('.title', title);
  });

  it('should allow creation of address inside test catalogue when various parameters provided', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    cy.get('[data-cy=create-action]').should('be.disabled');

    AddressPage.CreateDialog.fillPersonType(new Address('', 'firstName' + Utils.randomString()), []);
    cy.get('[data-cy=create-action]').should('be.disabled');

    AddressPage.CreateDialog.fillPersonType(new Address('', '', 'lastName' + Utils.randomString()), []);
    cy.get('[data-cy=create-action]').should('be.enabled');

    AddressPage.CreateDialog.fillPersonType(new Address('', '', ''), []);
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

    Menu.switchTo('DOCUMENTS');
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

  it('Should allow catalog admin to delete address with references after replacing it with another #3811', () => {
    Menu.switchTo('ADDRESSES');
    Tree.openNode(['address_with_reference_to_delete_catalog_admin']);
    AddressPage.deleteLoadedNode(true);
    cy.get('ige-replace-address-dialog').contains(
      'Das Dokument wird bereits von mindestens einem Dokument referenziert. Möchten Sie die Adresse ersetzen?'
    );
    cy.get('[data-cy=dialog-choose-address]').click();
    Tree.openNodeInsideDialog(['address_to _be_replaced_catalog_admin']);
    AddressPage.submitReplaceAddress();

    cy.get('ige-replace-address-dialog').contains('Die Adresse wurde erfolgreich ersetzt.');
    cy.get('ige-replace-address-dialog mat-dialog-actions button').contains('Schließen').click();

    cy.get('[data-cy=confirm-dialog-confirm]').click();
    cy.wait(300);
    // make sure the documents changed

    Tree.openNode(['address_to _be_replaced_catalog_admin']);
    AddressPage.openReferencedDocumentsSection();
    cy.get(
      '[data-cy="Zugeordnete Datensätze"] ige-referenced-documents-type mat-selection-list mat-list-option'
    ).contains('document_for_replace_address');
  });
});
