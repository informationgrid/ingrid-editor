import { DocumentPage, SEPARATOR } from '../../pages/document.page';
import { AddressPage, ROOT } from '../../pages/address.page';
import { Tree } from '../../pages/tree.partial';
import { Menu } from '../../pages/menu';
import { BasePage } from '../../pages/base.page';
import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';

describe('Load addresses', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin');
    AddressPage.visit();
  });

  it('should show a dashboard view when no address is selected or in root element', () => {
    cy.get('ige-form-dashboard', { timeout: 7000 }).should('contain', 'Adressen').should('contain', 'Neue Adresse');
    // expect(cy.get('ige-form-dashboard')).to.contain('text');
    cy.visit('/address;id=4ff589e1-d83c-4856-8bae-2ae783f69da6');
    cy.get('ige-form-info ige-breadcrumb .selectable').click();
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
    DocumentPage.search('Testorganisation');
    DocumentPage.getSearchResult().contains('Testorganisation').click();
    cy.get(DocumentPage.title).should('have.text', 'Testorganisation');
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
    cy.get('[data-cy="Zugeordnete Datensätze"] button').click();
    cy.get('ige-referenced-documents-type .mat-list-item').each(item => {
      cy.wrap(item).click();
      cy.contains('ige-header-title-row', item.text(), { timeout: 8000 });
    });
  });

  it('should "Adresse ersetzen" option exists only for catalog administrators and super users #3811', () => {
    Tree.openNode(['Neue Testadressen']);
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    AddressPage.closeReplaceAddressDialog();
    cy.logoutClearCookies();

    cy.kcLogin('eins');
    AddressPage.visit();
    Tree.openNode(['Neue Testadressen']);
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    AddressPage.closeReplaceAddressDialog();
    cy.logoutClearCookies();

    cy.kcLogin('meta2-with-groups');
    AddressPage.visit();
    Tree.openNode(['test_z, test_z']);
    cy.get('[data-cy="more-actions"]').should('not.exist');
    cy.logoutClearCookies();

    cy.kcLogin('author-with-groups');
    AddressPage.visit();
    Tree.openNode(['Ordner 2. Ebene']);
    cy.get('[data-cy="more-actions"]').should('not.exist');
    cy.logoutClearCookies();
  });

  it('should replace address contains referenced documents with another address #3811', () => {
    // open second address and make sure that it does contains any referenced documents
    Tree.openNode(['Folder_for_replace_address_test', 'second-empty-address']);
    AddressPage.openReferencedDocumentsSection();
    cy.get('[data-cy="Zugeordnete Datensätze"] ige-referenced-documents-type p').contains(
      'Es existieren keine Referenzen auf diese Adresse'
    );

    // open the first address and check for referenced documents
    Tree.openNode(['Folder_for_replace_address_test', 'first-address-with-reference-data']);
    cy.get(
      '[data-cy="Zugeordnete Datensätze"] ige-referenced-documents-type mat-selection-list mat-list-option'
    ).contains('document_for_replace_address');

    // replace the first address with the second
    AddressPage.openActionMenu();
    AddressPage.openReplaceAddressDialog();
    Tree.openNodeInsideDialog(['Folder_for_replace_address_test', 'second-empty-address']);
    AddressPage.submitReplaceAddress();
    cy.get('ige-replace-address-dialog').contains('Die Adresse wurde erfolgreich ersetzt.');
    cy.get('ige-replace-address-dialog mat-dialog-actions button').contains('Schließen').click();
    cy.get('[data-cy="Zugeordnete Datensätze"] ige-referenced-documents-type p').contains(
      'Es existieren keine Referenzen auf diese Adresse'
    );

    // make sure the documents changed
    Tree.openNode(['Folder_for_replace_address_test', 'second-empty-address']);
    cy.get(
      '[data-cy="Zugeordnete Datensätze"] ige-referenced-documents-type mat-selection-list mat-list-option'
    ).contains('document_for_replace_address');
  });

  it('Meta admin should not be allowed to delete Address if it is still referenced in data records #3811', () => {
    cy.logoutClearCookies();
    cy.kcLogin('meta2-with-groups');
    DocumentPage.visit();
    let addressName = 'address_with_reference_meta';
    Tree.openNode(['Folder1 For Meta2 ', 'Sub Folder', 'document1_meta2']);
    enterMcloudDocTestData.setAddress(addressName);
    DocumentPage.saveDocument();
    AddressPage.visit();
    Tree.openNode(['Ordner_2.Ebene_C', addressName]);
    AddressPage.deleteLoadedNode(true);
    BasePage.checkErrorDialogMessage(
      'Die Adresse wird von anderen Datensätzen referenziert und darf nicht entfernt werden.'
    );
  });
});
