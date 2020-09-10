import {DocumentPage, ROOT, SEPARATOR} from '../../pages/document.page';
import {Tree} from '../../pages/tree.partial';
import {Utils} from '../../pages/utils';

describe('General create documents/folders', () => {

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  beforeEach(() => {
    DocumentPage.visit();
  });


  describe('Create documents', () => {
    it('should create a root document', () => {

      const docName = 'Root Test-Dokument ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewDoc).click();

      cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(ROOT);
      cy.get('[data-cy=create-action]').should('be.disabled');

      cy.get('[data-cy=create-title]').type(docName);

      cy.get('[data-cy=create-action]')
        .should('be.enabled')
        .click();

      Tree.containsNodeWithTitle(docName);
      cy.get(DocumentPage.title).should('have.text', docName);

    });


  });


  describe('Create folders', () => {

    xit('should insert new folder at correct place in tree (#1990)', function () {

    });

    it('should not be possible to publish folders', function () {
      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get(DocumentPage.title).should('have.text', 'Testdokumente');
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');
      cy.visit('/form;id=bdde3ecb-3629-489c-86df-12ffac978ef5');
      cy.get(DocumentPage.title).should('have.text', 'Testdokumente');
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled')
    });

    it('should create a root folder', () => {

      const folderName = 'Root Ordner ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewFolder).click();

      cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(ROOT);
      cy.get('[data-cy=create-action]').should('be.disabled');

      cy.get('[data-cy=create-title]').type(folderName);

      cy.get('[data-cy=create-action]')
        .should('be.enabled')
        .click();

      Tree.containsNodeWithTitle(folderName);
      cy.get(DocumentPage.title).should('have.text', folderName);

    });

    it('should create a folder below a root folder which was selected before', () => {

      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Unterordner ' + Utils.randomString();

      Tree.selectNodeWithTitle(parentFolder);

      cy.get(DocumentPage.Toolbar.NewFolder).click();

      cy.get('.mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(`${ROOT}${SEPARATOR}${parentFolder}`);
      cy.get('[data-cy=create-title]').type(folderName);
      cy.get('[data-cy=create-action]').click();

      Tree.containsNodeWithTitle(folderName, 2);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(`${ROOT}${SEPARATOR}${parentFolder}`);

    });

    it('should create a folder by switching location in dialog to \'Daten\' when a root folder was selected initially', () => {
      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Root Ordner ' + Utils.randomString();

      Tree.selectNodeWithTitle(parentFolder);

      cy.get(DocumentPage.Toolbar.NewFolder).click();
      cy.get('[data-cy=create-title]').type(folderName);

      cy.get('[data-cy=create-changeLocation]').click();
      cy.get('ige-destination-selection mat-list-option').click();
      //check if 'Daten' is chosen
      cy.get("[aria-selected=true]").contains("Daten");

      cy.get('[data-cy=create-applyLocation]').click();
      cy.get('[data-cy=create-action]').click();

      Tree.containsNodeWithTitle(folderName, 1);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);

    });

    it('should create a folder by switching location in dialog to a sub folder when no node was selected initially', () => {
      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Unterordner ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewFolder).click();
      cy.get('[data-cy=create-title]').type(folderName);

      cy.get('[data-cy=create-changeLocation]').click();
      Tree.selectNodeWithTitle(parentFolder, true);

      cy.get('[data-cy=create-applyLocation]').click();
      cy.get('[data-cy=create-action]').click();

      Tree.containsNodeWithTitle(folderName, 2);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(`${ROOT}${SEPARATOR}${parentFolder}`);

    });

    it('should delete a folder with no children', () => {
      const folderName = 'Löschtestordner' + Utils.randomString();
      const childName = 'Testdokument' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewFolder).click();
      cy.get('[data-cy=create-title]').type(folderName);
      cy.get('[data-cy=create-action]').click();
      cy.get(DocumentPage.title).should('have.text', folderName);
      cy.wait(500);
      DocumentPage.createDocument(childName);
      cy.get(DocumentPage.title).should('have.text', childName);

      cy.get('#sidebar').findByText(folderName).click();
      cy.get(DocumentPage.title).should('have.text', folderName);
      cy.get(DocumentPage.Toolbar.Delete).click();

      cy.get('[data-cy=error-dialog-close]').click();
      cy.get('#sidebar').findByText(folderName).click();

      cy.get('#sidebar').findByText(childName).click();
      cy.get(DocumentPage.title).should('have.text', childName);
      cy.get(DocumentPage.Toolbar.Delete).click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();
      cy.wait(500);

      cy.get('#sidebar').findByText(folderName).click();
      cy.get(DocumentPage.title).should('have.text', folderName);
      cy.get(DocumentPage.Toolbar.Delete).click();
      cy.get('[data-cy=confirm-dialog-confirm]').click();
      cy.get('#sidebar').findByText(folderName).should('not.exist');
      cy.url().should('be', 'form');

    });
  });


  describe('Dirty checks', () => {
    it('should show a dialog when a document was modified and another document was clicked', () => {
      const doc1Name = 'Leeres mCLOUD Test Objekt';
      const doc2Name = 'Test mCLOUD Dokument';

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').findByText(doc2Name).click();
      cy.get('[data-cy=Beschreibung]').find('mat-form-field').type('testestest');

      // reject dialog
      // check selected tree node === previous selected node
      cy.wait(500);
      cy.get('span').contains(doc1Name).click();
      cy.get('.mat-dialog-title').contains('Änderungen sichern?');
      cy.get('[data-cy=confirm-dialog-cancel]').click();
      cy.get(DocumentPage.title).should('have.text', doc2Name);

      // accept dialog
      // check selected tree node === newly selected node
      cy.wait(500);
      cy.get('span').contains(doc1Name).click();
      cy.get('.mat-dialog-title').contains('Änderungen sichern?');
      cy.get('[data-cy=confirm-dialog-stay]').click();
      cy.get(DocumentPage.title).should('have.text', doc1Name);

    });

    it('should show a dialog when a document was modified and the page was changed', () => {
      const docname = 'Test mCLOUD Dokument';

      cy.get('#sidebar').findByText('Testdokumente').click();
      cy.get('#sidebar').findByText(docname).click();
      cy.get('[data-cy=Beschreibung]').find('mat-form-field').type('testestest');

      // TODO find out why clicking too fast does not open dialog
      // reject -> should stay on page
      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen sichern?');
      cy.get('[data-cy=confirm-dialog-cancel]').click();

      cy.get(DocumentPage.title).should('have.text', docname);


      // accept -> should load new page
      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen sichern?');
      cy.get('[data-cy=confirm-dialog-stay]').click();

      cy.get(DocumentPage.title).should('not.exist')


    });
  });
});
