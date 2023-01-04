import { DocumentPage, SEPARATOR } from '../../pages/document.page';
import { AddressPage, ROOT } from '../../pages/address.page';
import { Tree } from '../../pages/tree.partial';
import { Menu } from '../../pages/menu';
import { BasePage, CatalogsTabmenu } from '../../pages/base.page';
import { McloudDocumentPage } from '../../pages/mcloudDocument.page';
import { BehavioursPage } from '../../pages/behaviours.page';

describe('mCLOUD: Load addresses', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin');
    AddressPage.visit();
  });

  it('should show a dashboard view when no address is selected or in root element', () => {
    cy.get('ige-form-dashboard', { timeout: 7000 }).should('contain', 'Adressen').should('contain', 'Neue Adresse');
    // expect(cy.get('ige-form-dashboard')).to.contain('text');
    cy.visit('/address;id=4ff589e1-d83c-4856-8bae-2ae783f69da6');
    cy.get('ige-form-info ige-breadcrumb .selectable', { timeout: 6000 }).click();
    cy.get('ige-form-dashboard').should('contain', 'Adressen').should('contain', 'Neue Adresse');
  });

  it('should jump directly to a root address folder specified by URL', () => {
    cy.visit('/address;id=4ff589e1-d83c-4856-8bae-2ae783f69da6');
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'Neue Testadressen');
    cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
  });

  it('should jump directly to a nested address folder specified by URL', () => {
    cy.visit('/address;id=93ac91fc-4112-4975-86cb-48295a4d3915');
    cy.get(AddressPage.title, { timeout: 10000 }).should('have.text', 'Tiefe Adresse');
    // this function waits for text to appear, but shouldHaveTrimmedText not!
    cy.get('ige-form-info ige-breadcrumb').should(
      'have.text',
      `${ROOT}${SEPARATOR}Neue Testadressen${SEPARATOR}Ordner 2. Ebene`
    );
  });

  // tested in dashboard
  // xit('should open a document from a quick search result', () => {

  it('should open an address from a tree search result on form page', () => {
    McloudDocumentPage.search('Testorganisation');
    McloudDocumentPage.getSearchResult().contains('Testorganisation').click();
    cy.get(McloudDocumentPage.title).should('have.text', 'Testorganisation');
  });

  it('should open the previously selected address when going to another page and returning', () => {
    const addressTitle = 'Testorganisation';
    Tree.openNode(['Testadressen', addressTitle]);
    cy.get(AddressPage.title).should('have.text', addressTitle);
    Menu.switchTo('DASHBOARD');
    Menu.switchTo('DOCUMENTS');
    Menu.switchTo('ADDRESSES');
    cy.get(AddressPage.title).should('have.text', addressTitle);
  });

  it('should be able to jump between address and document to which it has been associated', () => {
    // open address
    Tree.openNode(['Neue Testadressen', 'Adresse, Venetien']);
    // open up display "zugeordnete Datensätze"
    cy.get('ige-referenced-documents-type button').click();
    cy.get('ige-referenced-documents-type .mat-list-item').each(item => {
      cy.wrap(item).click();
      cy.contains('ige-header-title-row', item.text(), { timeout: 8000 });
    });
  });

  it('should "Adresse ersetzen" option exists only for catalog administrators and super users (#3811)', () => {
    Tree.openNode(['test_z, test_z']);
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    AddressPage.closeReplaceAddressDialog();
    cy.logoutClearCookies();

    cy.kcLogin('mcloud-catalog-authorization');
    AddressPage.visit();
    Tree.openNode(['test_z, test_z']);
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    AddressPage.closeReplaceAddressDialog();
    cy.logoutClearCookies();

    cy.kcLogin('mcloud-meta-with-groups');
    AddressPage.visit();
    Tree.openNode(['test_z, test_z']);
    cy.get('[data-cy="more-actions"]').should('not.exist');
    cy.logoutClearCookies();

    cy.kcLogin('mcloud-author-with-group');
    AddressPage.visit();
    Tree.openNode(['Ordner 2. Ebene', 'Aquitanien, Adresse']);
    cy.get('[data-cy="more-actions"]').should('not.exist');
    cy.logoutClearCookies();
  });

  it('should replace address contains referenced documents with another address (#3811)', () => {
    // open second address and make sure that it does contains any referenced documents
    Tree.openNode(['Folder_for_replace_address_test', 'second-empty-address']);
    AddressPage.openReferencedDocumentsSection();
    cy.get('ige-referenced-documents-type p').contains('Es existieren keine Referenzen auf diese Adresse');

    // open the first address and check for referenced documents
    Tree.openNode(['Folder_for_replace_address_test', 'first-address-with-reference-data']);
    cy.get('ige-referenced-documents-type mat-selection-list mat-list-option').contains('document_for_replace_address');

    // replace the first address with the second
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    Tree.openNodeInsideDialog(['Folder_for_replace_address_test', 'second-empty-address']);
    AddressPage.submitReplaceAddress();
    AddressPage.confirmReplaceAddress();
    cy.get('ige-replace-address-dialog').contains('Die Adresse wurde erfolgreich ersetzt.');
    cy.get('ige-replace-address-dialog mat-dialog-actions button').contains('Schließen').click();
    cy.get('ige-referenced-documents-type p').contains('Es existieren keine Referenzen auf diese Adresse');

    // make sure the documents changed
    Tree.openNode(['Folder_for_replace_address_test', 'second-empty-address']);
    cy.get('ige-referenced-documents-type mat-selection-list mat-list-option').contains('document_for_replace_address');
  });

  it('should not be able to replace address with non-published address (#4571)', () => {
    const unpublishedAddress = 'ggg';

    Tree.openNode(['test_ö, test_ö']);

    // make sure non-published address can not be chosen by click
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    Tree.openNodeInsideDialog([unpublishedAddress]);
    cy.contains('ige-replace-address-dialog mat-tree-node', unpublishedAddress).should('not.have.class', 'active');

    // make sure non-published address can not be chosen via search term suggestion (-> siehe bug #4571)
    cy.get('ige-replace-address-dialog .mat-input-element').clear().click().type(unpublishedAddress);
    cy.contains('mat-option .doc-item', unpublishedAddress).click();
    cy.contains('ige-replace-address-dialog mat-tree-node', unpublishedAddress).should('not.have.class', 'active');
    cy.get('[data-cy="dialog-replace-address"]').should('have.attr', 'disabled');
  });

  it('Meta admin should not be allowed to delete Address if it is still referenced in data records (#3811)', () => {
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-with-groups');
    McloudDocumentPage.visit();
    let addressName = 'address_with_reference_meta';
    Tree.openNode(['Folder1 For Meta2 ', 'Sub Folder', 'document1_meta2']);
    McloudDocumentPage.setAddress(addressName);
    McloudDocumentPage.saveDocument();
    AddressPage.visit();
    Tree.openNode(['Ordner_2.Ebene_C', addressName]);
    AddressPage.deleteLoadedNode(true);
    AddressPage.checkErrorDialogMessage(
      'Die Adresse wird von anderen Datensätzen referenziert und darf nicht entfernt werden.'
    );
  });
});

describe('Load addresses', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    DocumentPage.visit();
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

  it('should check for the content of preview dialog for Test catalog (address), (#4269)', function () {
    AddressPage.visit();
    // open published document and check for the content
    Tree.openNode(['topreview, address']);
    cy.get(AddressPage.Toolbar.Preview).click();

    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=Anrede] ige-print-type ', 'Herr');
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=Anrede] ige-print-type ', 'Prof.');
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=Name] input ', 'address', 0, true);
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=Name] input ', 'topreview', 1, true);
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=contact]  ', 'Telefon');
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=contact]  input', '123456', 0, true);

    // check for address details
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address] input  ', 'unknown', 1, true);
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address] input  ', '2132', 2, true);
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address] input  ', 'north pole', 3, true);
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address] input  ', '123', 4, true);
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address] input ', '123', 5, true);

    // check for country and state
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address]  ', 'Deutschland');
    AddressPage.checkOfExistingItem('mat-dialog-content [data-cy=address]  ', 'Hessen');
  });

  it('should not display toggle button for referenced documents if there are none', () => {
    AddressPage.visit();
    Tree.openNode(['topreview, address']);
    cy.get('[data-cy="toggle-ref-docs-btn"]').should('not.exist');
    cy.get('[data-cy="no-refs-doc-hint"]').should('exist');
  });
});
