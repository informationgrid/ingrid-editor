import { DocumentPage, ROOT, SEPARATOR } from '../../pages/document.page';
import { Tree } from '../../pages/tree.partial';
import { Utils } from '../../pages/utils';
import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';

describe('General create documents/folders', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
    DocumentPage.visit();
  });

  describe('Create documents', () => {
    it('should create a root document', () => {
      const docName = 'Root Test Dokument' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewDoc).click();

      cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(ROOT);
      cy.get('[data-cy=create-action]').should('be.disabled');

      cy.get('[data-cy=create-title]').type(docName);

      cy.get('[data-cy=create-action]').should('be.enabled').click();

      Tree.containsNodeWithObjectTitle(docName);
      cy.get(DocumentPage.title).should('have.text', docName);
    });
  });

  describe('Create folders', () => {
    it('should insert new folder at correct place in tree (#1990)', function () {
      const folderName = 'x: a folder at place x';

      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene']);
      Tree.selectNodeAndCheckPath('Test mCLOUD Dokument', [ROOT, 'Testdokumente']);

      DocumentPage.createFolder(folderName, []);
      // check if created folder is in root
      Tree.selectNodeAndCheckPath(folderName, [ROOT]);

      // check if at beginning selected document is at the same place as before
      Tree.selectNodeAndCheckPath('Test mCLOUD Dokument', [ROOT, 'Testdokumente']);
    });

    it('should not be possible to publish folders', function () {
      Tree.openNode(['Testdokumente']);
      cy.get(DocumentPage.title).should('have.text', 'Testdokumente');
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');
      cy.visit('/form;id=bdde3ecb-3629-489c-86df-12ffac978ef5');
      cy.get(DocumentPage.title).should('have.text', 'Testdokumente');
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');
    });

    it('should create a root folder', () => {
      const folderName = 'Root Ordner' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewFolder).click();

      Tree.checkPath([ROOT]);
      cy.get('[data-cy=create-action]').should('be.disabled');

      cy.get('[data-cy=create-title]').type(folderName);

      cy.get('[data-cy=create-action]').should('be.enabled').click();

      Tree.containsNodeWithFolderTitle(folderName);
      cy.get(DocumentPage.title).should('have.text', folderName);
    });

    it('should create a folder below a root folder which was selected before', () => {
      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Unterordner' + Utils.randomString();

      Tree.openNode([parentFolder]);

      cy.get(DocumentPage.Toolbar.NewFolder).click();

      Tree.checkPath([ROOT, parentFolder], true);
      cy.get('[data-cy=create-title]').type(folderName);
      cy.get('[data-cy=create-action]').click();

      Tree.containsNodeWithFolderTitle(folderName, 2);
      Tree.selectNodeAndCheckPath(folderName, ['Daten', parentFolder]);
    });

    it("should create a folder by switching location in dialog to 'Daten' when a root folder was selected initially", () => {
      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Root Ordner' + Utils.randomString();

      Tree.openNode([parentFolder]);

      DocumentPage.createFolder(folderName, []);

      Tree.containsNodeWithFolderTitle(folderName, 1);
      cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
    });

    it('should create a folder by switching location in dialog to a sub folder when no node was selected initially', () => {
      const parentFolder = 'Neue Testdokumente';
      const folderName = 'Unterordner' + Utils.randomString();

      DocumentPage.createFolder(folderName, [parentFolder]);
      Tree.containsNodeWithFolderTitle(folderName, 2);

      cy.get('ige-form-info ige-breadcrumb').should('have.text', `${ROOT}${SEPARATOR}${parentFolder}`);
    });

    it('should delete a folder with no children', () => {
      const folderName = 'Löschtestordner' + Utils.randomString();
      const childName = 'Testdokument' + Utils.randomString();

      DocumentPage.createFolder(folderName);
      cy.get(DocumentPage.title).should('have.text', folderName);
      DocumentPage.createDocument(childName);
      cy.get(DocumentPage.title).should('have.text', childName);

      Tree.openNode([folderName]);
      cy.get(DocumentPage.title).should('have.text', folderName);
      cy.get(DocumentPage.Toolbar.Delete).click();

      cy.get('[data-cy=error-dialog-close]').click();

      // first delete child
      Tree.openNode([folderName, childName]);
      cy.get(DocumentPage.title).should('have.text', childName);
      DocumentPage.deleteLoadedNode();
      cy.wait(500);

      // the delete parent
      Tree.openNode([folderName]);
      DocumentPage.deleteLoadedNode();

      cy.get('#sidebar').findByText(folderName).should('not.exist');
      cy.url().should('match', /form$/);
    });
  });

  describe('Dirty checks', () => {
    it('should show a dialog when a document was modified and another document was clicked', () => {
      const docName = 'mCLOUD Dokument Test';

      DocumentPage.createDocument(docName);

      enterMcloudDocTestData.setDescription('modified test description');

      // reject dialog
      // check selected tree node === previous selected node
      cy.wait(500);
      Tree.clickOnNodeWithTitle('Testdokumente');
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-cancel]').click();
      cy.get(DocumentPage.title).should('have.text', docName);

      // accept dialog
      // check selected tree node === newly selected node
      cy.wait(500);
      Tree.clickOnNodeWithTitle('Testdokumente');
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-save]').click();
      cy.get(DocumentPage.title).should('have.text', 'Testdokumente');
    });

    it('should show a dialog when a document was modified and the page was changed', () => {
      const docname = 'Test mCLOUD Dokument';

      Tree.openNode(['Testdokumente', docname]);

      enterMcloudDocTestData.setDescription('modified test description');

      // TODO find out why clicking too fast does not open dialog
      // reject -> should stay on page
      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-stay]').click();

      cy.get(DocumentPage.title).should('have.text', docname);

      // accept (don't save) -> should load new page
      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-leave]').click();

      cy.get(DocumentPage.title).should('not.exist');
    });

    it('should not remember last dirty state when page has been left (#2121)', () => {
      Tree.openNode(['Testdokumente', 'Test mCLOUD Dokument']);
      enterMcloudDocTestData.setDescription('modified test description');

      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-leave]').click();

      // check we are on dashboard page
      cy.url().should('include', '/dashboard');

      cy.get(DocumentPage.Sidemenu.Daten).click();
      cy.wait(500);
      cy.get(DocumentPage.title).should('have.text', 'Test mCLOUD Dokument');
    });

    it('should not possible to delete a non-empty folder  (#2115)', () => {
      Tree.openNode(['Testdokumente', 'Ordner 2. Ebene']);

      // check that selected node is not empty
      Tree.selectNodeAndCheckPath('Ordner 2. Ebene', ['Daten', 'Testdokumente']);

      Tree.openNode(['Testdokumente']);

      cy.get(DocumentPage.Toolbar['Delete']).click();

      cy.hasErrorDialog('Um Ordner zu löschen, müssen diese leer sein');
    });

    it('check for ordering and sorting mCloud and openData category lists in the mCLOUD document', () => {
      let category1 = 'Bahn';
      let category2 = 'Straßen';
      let category3 = 'Luft- und Raumfahrt';

      let mCLOUDSelector = '[data-cy="mCLOUD Kategorie"] mat-chip-list ';

      Tree.openNode(['New Folder For New Users', 'New Document']);
      DocumentPage.scrollToSection('mCLOUD');
      enterMcloudDocTestData.setCategory(category1);
      cy.get(mCLOUDSelector).contains(category1);

      enterMcloudDocTestData.setCategory(category2, false);
      cy.get(mCLOUDSelector).contains(category2);

      enterMcloudDocTestData.setCategory(category3, false);
      cy.get(mCLOUDSelector).contains(category3);

      // change the order of mCloud categories by dragging then save
      DocumentPage.dragItem(
        mCLOUDSelector + ' mat-chip',
        '[data-cy="mCLOUD Kategorie"] mat-chip-list:last',
        2,
        -200,
        0
      );
      DocumentPage.saveDocument();

      // check for the order after reload
      cy.reload();

      DocumentPage.checkOfExistingItem(mCLOUDSelector + ' mat-chip', category3, 0);
      DocumentPage.checkOfExistingItem(mCLOUDSelector + ' mat-chip', category2, 2);
      DocumentPage.checkOfExistingItem(mCLOUDSelector + ' mat-chip', category1, 1);

      DocumentPage.scrollToSection('mCLOUD');
      // add openData categories and check of the order after drag and drop
      let openDataCategory1 = 'Energie';
      let openDataCategory2 = 'Gesundheit';
      let openDataCategory3 = 'Internationale Themen';

      let openDataSelector = '[data-cy="OpenData Kategorie"] mat-chip-list ';
      enterMcloudDocTestData.setOpenDataCategory(openDataCategory1);
      cy.get(openDataSelector).contains(openDataCategory1);

      enterMcloudDocTestData.setOpenDataCategory(openDataCategory2, false);
      cy.get(openDataSelector).contains(openDataCategory2);

      enterMcloudDocTestData.setOpenDataCategory(openDataCategory3, false);
      cy.get(openDataSelector).contains(openDataCategory3);

      // change the order of mCloud categories by dragging then save
      DocumentPage.dragItem(
        openDataSelector + ' mat-chip',
        '[data-cy="OpenData Kategorie"] mat-chip-list:last',
        2,
        -200,
        0
      );
      DocumentPage.saveDocument();

      // reload and make sure of ordering
      cy.reload();
      DocumentPage.checkOfExistingItem(openDataSelector + ' mat-chip', openDataCategory3, 0);
      DocumentPage.checkOfExistingItem(openDataSelector + ' mat-chip', openDataCategory2, 2);
      DocumentPage.checkOfExistingItem(openDataSelector + ' mat-chip', openDataCategory1, 1);
    });

    it('check for ordering and sorting address lists in the mCLOUD document', () => {
      let address1 = 'mclould_address';
      let address2 = 'Published Testorganization';
      let addressSelector = '[data-cy="Adressen"] .address-cards .address-card-wrapper';

      Tree.openNode(['New Folder For New Users', 'New Document']);
      enterMcloudDocTestData.setAddress(address1);
      enterMcloudDocTestData.setAddress(address2);

      DocumentPage.scrollToSection('Allgemeines');

      DocumentPage.dragItem(addressSelector, '[data-cy="Adressen"] .address-cards .address-card-wrapper', 1, -200, 0);

      DocumentPage.saveDocument();

      // reload and make sure of ordering
      cy.reload();
      DocumentPage.checkOfExistingItem(addressSelector, address2, 0);
      DocumentPage.checkOfExistingItem(addressSelector, address1, 1);
    });

    it('check for ordering and sorting Zeitbezug der Ressource lists in the mCLOUD document', () => {
      let date1 = new Date(2023, 2, 10);
      let date2 = new Date(2022, 2, 12);
      let date3 = new Date(2025, 2, 11);
      let type1 = 'Letzte Änderung';
      let type2 = 'Erstellung';

      let resourceDateSelector = '[data-cy="Zeitbezug der Ressource"] ige-repeat .cdk-drag-handle';

      Tree.openNode(['New Folder For New Users', 'New Document']);

      DocumentPage.scrollToSection('Zeitbezüge');

      enterMcloudDocTestData.setTimeReference(date1, type1, 0);
      enterMcloudDocTestData.setTimeReference(date2, type2, 1);
      enterMcloudDocTestData.setTimeReference(date3, type1, 2);
      DocumentPage.saveDocument();

      // here we have to give sometime between the two save actions so that the checking  of the 'gespeichert' message for the second save
      // does not mix with the first one
      cy.wait(1200);
      DocumentPage.scrollToSection('Zeitbezüge');
      DocumentPage.dragItem(resourceDateSelector, '[data-cy="Zeitbezug der Ressource"] ige-repeat ', 1, 0, 70);

      // check the new position of the items before saving to make sure the dragging was successful
      cy.wait(2000);
      DocumentPage.checkOfExistingItem(
        '[data-cy="Zeitbezug der Ressource"] ige-repeat .mat-datepicker-input',
        '12.02.2022',
        2,
        true
      );
      DocumentPage.checkOfExistingItem(
        '[data-cy="Zeitbezug der Ressource"] ige-repeat .mat-datepicker-input',
        '11.02.2025',
        1,
        true
      );

      DocumentPage.saveDocument();

      // // reload and make sure of ordering
      cy.reload({ timeout: 10000 });
      DocumentPage.scrollToSection('Zeitbezüge');

      DocumentPage.checkOfExistingItem(
        '[data-cy="Zeitbezug der Ressource"] ige-repeat .mat-datepicker-input',
        '12.02.2022',
        2,
        true
      );
      DocumentPage.checkOfExistingItem(
        '[data-cy="Zeitbezug der Ressource"] ige-repeat .mat-datepicker-input',
        '11.02.2025',
        1,
        true
      );
    });

    it('check for ordering and sorting Download links in the mCLOUD document', () => {
      let title1 = 'google';
      let title2 = 'youtube';
      let title3 = 'amazon';
      let link1 = 'https://www.google.com';
      let link2 = 'https://www.youtube.com/';
      let link3 = 'https://www.amazon.de/';

      let downloadSelector = '[data-cy="Downloads-table"] mat-row mat-cell';
      Tree.openNode(['New Folder For New Users', 'New Document']);

      DocumentPage.scrollToSection('mCLOUD');
      enterMcloudDocTestData.setAddDownload(title1, link1);
      enterMcloudDocTestData.setAddDownload(title2, link2);
      enterMcloudDocTestData.setAddDownload(title3, link3);
      DocumentPage.saveDocument();

      // here we have to give sometime between the two save actions so that the checking  of the 'gespeichert' message for the second save
      // does not mix with the first one
      cy.wait(1200);

      DocumentPage.scrollToSection('mCLOUD');
      DocumentPage.dragItem(downloadSelector, '[data-cy="Downloads-table"] mat-row ', 0, 0, 100);

      DocumentPage.saveDocument();
      // // reload and make sure of ordering
      cy.reload({ timeout: 10000 });
      DocumentPage.scrollToSection('mCLOUD');

      DocumentPage.checkOfExistingItem(downloadSelector, 'youtube', 0);
    });
  });
});
