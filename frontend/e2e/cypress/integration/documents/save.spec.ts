import {DocumentPage} from '../../pages/document.page';
import {Tree} from '../../pages/tree.partial';
import {Utils} from '../../pages/utils';

const SEPARATOR = ' chevron_right';

describe('General create documents/folders', () => {

  beforeEach(() => {
    DocumentPage.visit();
  });


  describe('Create documents', () => {
    it('should create a root document', function () {

      const docName = 'Root Test-Dokument ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewDoc).click();

      cy.get('mat-dialog-container ige-breadcrumb').should('have.text', 'Daten');
      cy.get('[data-cy=new-doc-create]').should('be.disabled');

      cy.get('[data-cy=new-doc-title]').type(docName);

      cy.get('[data-cy=new-doc-create]')
        .should('be.enabled')
        .click();

      Tree.containsNodeWithTitle(docName);
      cy.get(DocumentPage.title).should('have.text', docName);

    });
  });

  describe('Publish documents', () => {
    it.only('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      DocumentPage.createDocument();

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      DocumentPage.publishNow();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });
  });

  describe('Create folders', () => {
    it('should create a root folder', function () {

      const folderName = 'Root Ordner ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewFolder).click();

      cy.get('mat-dialog-container ige-breadcrumb').should('have.text', 'Daten');
      cy.get('[data-cy=new-folder-create]').should('be.disabled');

      cy.get('[data-cy=new-folder-title]').type(folderName);

      cy.get('[data-cy=new-folder-create]')
        .should('be.enabled')
        .click();

      Tree.containsNodeWithTitle(folderName);
      cy.get(DocumentPage.title).should('have.text', folderName);

    });

    it('should create a folder below a root folder which was selected before', function () {

      const parentFolder = 'neues';
      const folderName = 'Unterordner ' + Utils.randomString();

      Tree.selectNodeWithTitle(parentFolder);

      cy.get(DocumentPage.Toolbar.NewFolder).click();

      cy.get('.mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(parentFolder);
      cy.get('[data-cy=new-folder-title]').type(folderName);
      cy.get('[data-cy=new-folder-create]').click();

      Tree.containsNodeWithTitle(folderName, 1);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(parentFolder + SEPARATOR);

    });

    it('should create a folder by switching location in dialog to \'Daten\' when a root folder was selected initially', function () {
      const parentFolder = 'neues';
      const folderName = 'Root Ordner ' + Utils.randomString();

      Tree.selectNodeWithTitle(parentFolder);

      cy.get(DocumentPage.Toolbar.NewFolder).click();
      cy.get('[data-cy=new-folder-title]').type(folderName);

      cy.get('[data-cy=new-folder-changeLocation]').click();
      cy.get('ige-destination-selection mat-list-option').click();

      cy.get('[data-cy=new-folder-create]').click();

      Tree.containsNodeWithTitle(folderName, 0);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText('Daten');

    });

    it('should create a folder by switching location in dialog to a sub folder when no node was selected initially', function () {
      const parentFolder = 'neues';
      const folderName = 'Unterordner ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewFolder).click();
      cy.get('[data-cy=new-folder-title]').type(folderName);

      cy.get('[data-cy=new-folder-changeLocation]').click();
      Tree.selectNodeWithTitle(parentFolder, 'mat-dialog-container');

      cy.get('[data-cy=new-folder-create]').click();

      Tree.containsNodeWithTitle(folderName, 1);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(parentFolder + SEPARATOR);

    });
  });
})
