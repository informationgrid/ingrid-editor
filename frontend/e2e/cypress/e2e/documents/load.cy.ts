import { DocumentPage, headerElements, ROOT, SEPARATOR } from '../../pages/document.page';
import { beforeEach } from 'mocha';
import { Tree } from '../../pages/tree.partial';
import { AddressPage } from '../../pages/address.page';
import { Utils } from '../../pages/utils';
import { Menu } from '../../pages/menu';

describe('Load documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test');
  });

  it('should display folder content correctly after saving the folder (#3944)', function () {
    DocumentPage.visit();
    // open folder and check for the content
    cy.visit('/form;id=a7bf5a24-921c-4910-b868-bd01c322a4a6');
    cy.contains('ige-folder-dashboard mat-card mat-card-title', 'Zuletzt bearbeitet im Ordner');
    cy.contains('ige-folder-dashboard mat-card  ige-document-list-item mat-list-option', 'MC_Dokument_1');

    // save the folder and check again
    DocumentPage.saveDocument();
    cy.contains('ige-folder-dashboard mat-card  ige-document-list-item mat-list-option', 'MC_Dokument_1');
  });

  it('should check for the content of preview dialog for Test catalog data record, (#4269)', function () {
    DocumentPage.visit();
    // open published document and check for the content
    Tree.openNode(['document_to_export']);
    cy.get(DocumentPage.Toolbar.Preview).click();

    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=description] ige-print-type ', 'test');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=addresses] ige-print-type ', 'address_for_export');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=mCloudCategories] ', 'Klima und Wetter');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=mCloudCategories] ', 'Straßen');
    DocumentPage.checkOfExistingItem(
      'mat-dialog-content [data-cy=DCATThemes]  ',
      ' Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel '
    );
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=DCATThemes]  ', 'Umwelt');

    // check for download table
    DocumentPage.checkOfExistingItem('mat-dialog-content ige-table-type  ', 'test', 0);

    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=license]  ', 'Andere Freeware Lizenz');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=origin]  ', 'test');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=mFUND] input  ', 'test', 0, true);
    DocumentPage.checkOfExistingItem('mat-dialog-content .spatial-title  ', 'Berlin Brandenburg Airport');

    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=events] input  ', '22.06.2022', 0, true);
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=events]  ', 'Letzte Änderung');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=temporal] input ', '30.06.2022', 0, true);
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=periodicity]  ', 'einmalig');
  });
});

describe('mCloud Load documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin');
  });

  // tested in dashboard
  // it('should load a document from dashboard', () => {

  it('should show a dashboard view when no document is selected or in root element', function () {
    DocumentPage.visit();
    cy.get('ige-form-dashboard', { timeout: 20000 }).should('exist');

    cy.get('ige-form-dashboard').should('contain', 'Daten').should('contain', 'Neuer Datensatz');
    // expect(cy.get('ige-form-dashboard')).to.contain('text');
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get('ige-form-info ige-breadcrumb .selectable', { timeout: 10000 }).click();
    cy.get('ige-form-dashboard').should('contain', 'Daten').should('contain', 'Neuer Datensatz');
  });

  it('should jump directly to a root folder specified by URL', () => {
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'Neue Testdokumente');
    cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
  });

  it('should jump directly to a nested folder specified by URL', () => {
    cy.visit('/form;id=9b264daf-3044-441d-864c-699b44c46dc1');
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'Tiefes Dokument');
    // this function waits for text to appear, but shouldHaveTrimmedText not!
    cy.get('ige-form-info ige-breadcrumb').should(
      'have.text',
      `${ROOT}${SEPARATOR}Testdokumente${SEPARATOR}Ordner 2. Ebene`
    );
  });

  // tested in dashboard
  // it('should open a document from a quick search result', () => {

  it('should open a document from a tree search result on form page', () => {
    DocumentPage.visit();
    DocumentPage.search('TestDocResearch1');
    DocumentPage.getSearchResult().click();
    cy.get(DocumentPage.title).should('have.text', 'TestDocResearch1');
  });

  it('should open the previously selected document when going to another page and returning', function () {
    DocumentPage.visitSingleDoc();
    cy.get(DocumentPage.title, { timeout: 6000 }).should('have.text', 'TestDocResearch2');
    Menu.switchTo('DASHBOARD');
    Menu.switchTo('ADDRESSES');
    Menu.switchTo('DOCUMENTS');
    cy.get(DocumentPage.title).should('have.text', 'TestDocResearch2');
  });

  it('should only show last used addresses of same catalog when adding address to document (#3335)', () => {
    // add address to document
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    DocumentPage.setAddress('Limousin, Adresse');
    DocumentPage.saveDocument();
    // visit new catalog and make sure recently added address is not among the suggestions
    cy.logoutClearCookies();
    cy.kcLogin('test-catalog-general-test');
    DocumentPage.visit();
    // add an address to a document so that afterwards the 'last used addresses' field contains this address
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    AddressPage.addAddressToTestDocument(['Testadressen', 'Organisation_30, Nachname30, Name30'], 'Ansprechpartner');
    AddressPage.saveDocument();
    // open document, open add-address-dialog and check "last used addresses"-field
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_2']);
    cy.get('[data-cy="addresses"] button').first().click();
    cy.get('mat-dialog-content [data-cy=tree-search-field] input').click();
    cy.get('[role="listbox"]').should(list => {
      expect(list).to.contain('Organisation_30, Nachname30, Name30');
      expect(list).to.not.contain('Limousin, Adresse');
    });
  });

  it('should show creation date of documents (#3478 (1))', () => {
    const docName = 'someNewDocument' + Utils.randomString();

    // create document
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A']);
    DocumentPage.createDocument(docName);
    cy.get(DocumentPage.title).should('have.text', docName);

    // check header
    DocumentPage.openUpDocumentHeader();
    DocumentPage.verifyInfoInDocumentHeader(
      headerElements.CreationDate,
      Utils.getFormattedDate(new Date()) + ' von ' + 'Andre Wallat'
    );
    // log in as different user
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-with-groups');

    // check header
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2A', docName]);
    cy.get(DocumentPage.title).should('have.text', docName);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.verifyInfoInDocumentHeader(
      headerElements.CreationDate,
      Utils.getFormattedDate(new Date()) + ' von ' + 'Andre Wallat'
    );
  });

  it('should show edit date of documents (#3478 (2))', () => {
    const docName = 'Datum_Ebene_3_3';

    // change document
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', docName]);
    DocumentPage.setDescription('description to alter document');
    DocumentPage.saveDocument();

    // check header
    DocumentPage.openUpDocumentHeader();
    DocumentPage.verifyInfoInDocumentHeader(
      headerElements.EditDate,
      Utils.getFormattedDate(new Date()) + ' von ' + 'Andre Wallat'
    );

    // log in as different user
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-catalog-authorization');

    // check header
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', docName]);
    cy.get(DocumentPage.title).should('have.text', docName);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.verifyInfoInDocumentHeader(
      headerElements.EditDate,
      Utils.getFormattedDate(new Date()) + ' von ' + 'Andre Wallat'
    );

    // change document and check altered header
    DocumentPage.setDescription('another description to alter document');
    DocumentPage.saveDocument();
    DocumentPage.openUpDocumentHeader();
    DocumentPage.verifyInfoInDocumentHeader(
      headerElements.EditDate,
      Utils.getFormattedDate(new Date()) + ' von ' + 'Katalog Admin1'
    );
  });

  it('should compare working version and published version (#4635)', function () {
    DocumentPage.visit();
    Tree.openNode(['Veröffentlichter Datensatz mit Bearbeitungsversion']);
    cy.get(DocumentPage.Toolbar.Preview).click();
    cy.contains('.mat-dialog-title', 'Vorschau').should('exist');
    cy.contains('button[name="compareView"]', 'Vergleichsansicht').click();

    // check preview has been opened with split view for comparison
    cy.get('mat-dialog-container .working').should('exist');
    cy.get('mat-dialog-container .published').should('exist');

    // check versions differ
    cy.get('.published [data-cy="description"] ige-print-type').then(published_descr => {
      cy.get('.working [data-cy="description"] ige-print-type').then(draft_descr => {
        cy.wrap(draft_descr.text()).should('not.equal', published_descr.text());
      });
    });
  });

  it('should not open comparative view when opening unchanged published doc (#4635)', function () {
    // open published document without changes after publishing
    DocumentPage.visit();
    Tree.openNode(['TestDocResearch4']);
    cy.get(DocumentPage.Toolbar.Preview).click();
    cy.contains('.mat-dialog-title', 'Vorschau').should('exist');
    cy.contains('button[name="compareView"]', 'Vergleichsansicht').should('not.exist');

    // check preview has not been opened with split view
    cy.get('mat-dialog-container').should('exist');
    cy.get('mat-dialog-container .working').should('not.exist');
  });
});
