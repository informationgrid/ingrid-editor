import { ImportOptions, ImportPage } from '../../pages/import.page';
import { Tree } from '../../pages/tree.partial';
import { DocumentPage } from '../../pages/document.page';
import { AddressPage } from '../../pages/address.page';
import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';

describe('Import Tests', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user').as('tokens');
    ImportPage.visit();
  });

  it('should import json document (new document, new address) with option "Anlage unter gewähltem Importknoten"', () => {
    const fileTitle = 'importtest_2.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.CreateUnderTarget);
    ImportPage.continue();
    Tree.openNode(['Testdokumente'], false, false);
    Tree.openNode(['Neue Testadressen'], false, false);
    ImportPage.closeDialogAndImport();
    ImportPage.jumpToDocument('document_import_32');
    Tree.checkPath(['Daten', 'Testdokumente']);

    DocumentPage.jumpFromDocumentToAddress('Transsilvanien, Adresse');
    Tree.checkTitleOfSelectedNode('Transsilvanien, Adresse');
    Tree.checkPath(['Adressen', 'Neue Testadressen']);
  });

  it('should import json document (new document, existing address) with option "Anlage unter gewähltem Importknoten"', () => {
    const fileTitle = 'importtest_1.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.CreateUnderTarget);
    ImportPage.continue();
    Tree.openNode(['Testdokumente'], false, false);
    Tree.openNode(['Testadressen'], false, false);
    ImportPage.closeDialogAndImport();
    ImportPage.jumpToDocument('document_import_12');
    Tree.checkPath(['Daten', 'Testdokumente']);

    DocumentPage.jumpFromDocumentToAddress('Aquitanien, Adresse');
    Tree.checkTitleOfSelectedNode('Aquitanien, Adresse');
    Tree.checkPath(['Adressen', 'Neue Testadressen', 'Ordner 2. Ebene']);
  });

  it('should import json document (new document, new address) with option "identische Metadaten überschreiben"', () => {
    const fileTitle = 'importtest_3.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.OverwriteMetadata);
    ImportPage.continue();
    Tree.openNode(['Testdokumente'], false, false);
    Tree.openNode(['Testadressen'], false, false);
    ImportPage.closeDialogAndImport();

    ImportPage.jumpToDocument('document_import_43');
    Tree.checkPath(['Daten', 'Testdokumente']);
    DocumentPage.jumpFromDocumentToAddress('Sibirien, Adresse');
    Tree.checkTitleOfSelectedNode('Sibirien, Adresse');
    Tree.checkPath(['Adressen', 'Testadressen']);
  });

  it('should import json document (existing document, new address) with option "identische Metadaten überschreiben"', () => {
    const fileTitle = 'importtest_4.json';

    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.OverwriteMetadata);
    ImportPage.continue();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B'], false, false);
    Tree.openNode(['Testadressen'], false, false);
    ImportPage.closeDialogAndImport();

    ImportPage.jumpToDocument('Datum_Ebene_4_4');
    Tree.checkPath(['Daten', 'Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B']);
    DocumentPage.jumpFromDocumentToAddress('Schlesien, Adresse');
    Tree.checkTitleOfSelectedNode('Schlesien, Adresse');
    Tree.checkPath(['Adressen', 'Testadressen']);
  });

  it('should import json document (existing document, existing address) with option "identische Metadaten überschreiben"', () => {
    const fileTitle = 'importtest_5.json';

    // add address to document
    DocumentPage.visit();
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene', 'Tiefes Dokument']);
    enterMcloudDocTestData.CreateDialog.setAddress('Franken, Adresse');
    AddressPage.saveDocument();
    // import file
    ImportPage.visit();
    ImportPage.addFile(fileTitle);
    ImportPage.continue();
    ImportPage.chooseImportOption(ImportOptions.OverwriteMetadata);
    ImportPage.continue();
    Tree.openNode(['Testdokumente', 'Ordner 2. Ebene'], false, false);
    Tree.openNode(['Neue Testadressen'], false, false);
    ImportPage.closeDialogAndImport();

    ImportPage.jumpToDocument('Tiefes Dokument');
    DocumentPage.jumpFromDocumentToAddress('Franken, Adresse');

    Tree.checkTitleOfSelectedNode('Franken, Adresse');
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
