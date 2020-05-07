import {DocumentPage, ROOT} from '../../pages/document.page';
import {Tree} from '../../pages/tree.partial';
import {Utils} from '../../pages/utils';

describe('General create documents/folders', () => {

  beforeEach(() => {
    cy.kcLogin('user');
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

  describe('Publish documents', () => {
    it('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      DocumentPage.createDocument();

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      DocumentPage.publishNow();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });
  });

  describe('Create folders', () => {
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

      cy.get('.mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(ROOT + ' ' + parentFolder);
      cy.get('[data-cy=create-title]').type(folderName);
      cy.get('[data-cy=create-action]').click();

      Tree.containsNodeWithTitle(folderName, 1);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT + ' ' + parentFolder + SEPARATOR);

    });

    it('should create a folder by switching location in dialog to \'Daten\' when a root folder was selected initially', () => {
      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Root Ordner ' + Utils.randomString();

      Tree.selectNodeWithTitle(parentFolder);

      cy.get(DocumentPage.Toolbar.NewFolder).click();
      cy.get('[data-cy=create-title]').type(folderName);

      cy.get('[data-cy=create-changeLocation]').click();
      cy.get('ige-destination-selection mat-list-option').click();

      cy.get('[data-cy=create-applyLocation]').click();
      cy.get('[data-cy=create-action]').click();

      Tree.containsNodeWithTitle(folderName, 0);
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

      Tree.containsNodeWithTitle(folderName, 1);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT + ' ' + parentFolder + SEPARATOR);

    });
  });
})
