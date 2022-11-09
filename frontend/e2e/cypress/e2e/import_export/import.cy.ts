import { ImportOptions, ImportPage } from '../../pages/import.page';
import { Tree } from '../../pages/tree.partial';
import { DocumentPage } from '../../pages/document.page';
import { AddressPage } from '../../pages/address.page';
import { McloudDocumentPage } from '../../pages/mcloudDocumentPage';

describe('Import Tests', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    ImportPage.visit();
  });

  it('should import json document (new document, new address) with option "Anlage unter gewähltem Importknoten"', () => {
    const fileTitle = 'importtest_2.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.CreateUnderTarget);
    ImportPage.continue();
    Tree.openNode(['Testdokumente'], false);
    Tree.openNode(['Neue Testadressen'], false);
    ImportPage.closeDialogAndImport();
    ImportPage.jumpToDocument('document_import_32');
    Tree.checkPath(['Daten', 'Testdokumente']);

    DocumentPage.jumpFromDocumentToAddress('Transsilvanien, Adresse');
    cy.get(DocumentPage.title).should('have.text', 'Transsilvanien, Adresse');
    Tree.checkPath(['Adressen', 'Neue Testadressen']);
  });

  it('should import json document (new document, existing address) with option "Anlage unter gewähltem Importknoten"', () => {
    const fileTitle = 'importtest_1.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.CreateUnderTarget);
    ImportPage.continue();
    Tree.openNode(['Testdokumente'], false);
    Tree.openNode(['Testadressen'], false);
    ImportPage.closeDialogAndImport();
    ImportPage.jumpToDocument('document_import_12');
    Tree.checkPath(['Daten', 'Testdokumente']);

    DocumentPage.jumpFromDocumentToAddress('Aquitanien, Adresse');
    cy.get(DocumentPage.title).should('have.text', 'Aquitanien, Adresse');
    Tree.checkPath(['Adressen', 'Neue Testadressen', 'Ordner 2. Ebene']);
  });

  it('should import json document (new document, new address) with option "identische Metadaten überschreiben"', () => {
    const fileTitle = 'importtest_3.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.OverwriteMetadata);
    ImportPage.continue();
    Tree.openNode(['Testdokumente'], false);
    Tree.openNode(['Testadressen'], false);
    ImportPage.closeDialogAndImport();

    ImportPage.jumpToDocument('document_import_43');
    Tree.checkPath(['Daten', 'Testdokumente']);
    DocumentPage.jumpFromDocumentToAddress('Sibirien, Adresse');
    cy.get(DocumentPage.title).should('have.text', 'Sibirien, Adresse');
    Tree.checkPath(['Adressen', 'Testadressen']);
  });

  it('should import json document (existing document, new address) with option "identische Metadaten überschreiben"', () => {
    const fileTitle = 'importtest_4.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.OverwriteMetadata);
    ImportPage.continue();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B'], false);
    Tree.openNode(['Testadressen'], false);
    ImportPage.closeDialogAndImport();

    ImportPage.jumpToDocument('Datum_Ebene_4_4');
    Tree.checkPath(['Daten', 'Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B']);
    DocumentPage.jumpFromDocumentToAddress('Rheinland, Adresse');
    cy.get(DocumentPage.title).should('have.text', 'Rheinland, Adresse');
    Tree.checkPath(['Adressen', 'Neue Testadressen', 'Ordner 2. Ebene', 'Ordner_3.Ebene_A', 'Ordner_4.Ebene_A']);
  });

  it('should import json document (existing document, existing address) with option "identische Metadaten überschreiben"', () => {
    const fileTitle = 'importtest_5.json';

    // add address to document
    DocumentPage.visit();
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', 'Tiefes Dokument']);
    McloudDocumentPage.setAddress('Franken, Adresse');
    AddressPage.saveDocument();
    // import file
    ImportPage.visit();
    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.OverwriteMetadata);
    ImportPage.continue();
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene'], false);
    Tree.openNode(['Neue Testadressen'], false);
    ImportPage.closeDialogAndImport();

    ImportPage.jumpToDocument('Tiefes Dokument');
    DocumentPage.jumpFromDocumentToAddress('Franken, Adresse');
    cy.get(DocumentPage.title).should('have.text', 'Franken, Adresse');
    Tree.checkPath(['Adressen', 'Neue Testadressen']);
  });

  it('should give hint when trying to import not-importable file', () => {
    ImportPage.tryAddFileInWrongFormat('Test.pdf');
    cy.get('.mat-line.mat-error').should('contain', 'No importer found');
    // make sure file is not accepted when retrying
    cy.contains('button', 'Erneut versuchen').click();
    cy.contains('button', 'Weiter').should('be.disabled');
  });
});
