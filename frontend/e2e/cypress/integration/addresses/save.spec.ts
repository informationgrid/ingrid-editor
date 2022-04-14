import { DocumentPage, headerElements, PublishOptions } from '../../pages/document.page';
import { Utils } from '../../pages/utils';
import { Address, AddressPage } from '../../pages/address.page';
import { Tree } from '../../pages/tree.partial';
import { CopyCutUtils } from '../../pages/copy-cut-utils';
import { Todo } from '@datorama/akita/src/__tests__/setup';
import { Menu } from '../../pages/menu';

describe('General create addresses/folders', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    AddressPage.visit();
  });

  const createDialog = AddressPage.CreateDialog;

  describe('Create Folder', () => {
    it('should show all nested folders after creation when root parent is collapsed and expanded', () => {
      // create root folder "Nested"
      const rootFolder = 'Nested';
      DocumentPage.createFolder(rootFolder, []);
      // create another folder under "Nested" with name "More nested"
      const moreNested = 'More nested';
      DocumentPage.createFolder(moreNested, [rootFolder]);

      // create another folder under "More nested" with name "Even more nested"
      const evenMoreNested = 'Even More nested';
      Tree.openNode([rootFolder, moreNested]);
      DocumentPage.createFolder(evenMoreNested, [rootFolder, moreNested]);

      // collapse "Nested"
      Tree.openNode([rootFolder]);
      // expand "Nested" and "More nested"
      Tree.openNode([rootFolder, moreNested]);
      // assert that directory "Even more nested" exists
      Tree.openNode([rootFolder, moreNested, evenMoreNested]);
    });
  });

  describe('Create Addresses', () => {
    it('should allow creation if one of firstname, lastname or organization was filled', () => {
      createDialog.open();
      cy.get('[data-cy=create-action]').should('be.disabled');

      createDialog.fillOrganizationType(new Address('Thomas-Organisation'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      createDialog.fillOrganizationType(new Address('', 'Herbst'));
      cy.get('[data-cy=create-action]').should('be.disabled');

      createDialog.fillOrganizationType(new Address('', '', 'Ich AG'));
      cy.get('[data-cy=create-action]').should('be.disabled');

      createDialog.fillOrganizationType(new Address('', '', ''));
      cy.get('[data-cy=create-action]').should('be.disabled');
    });

    it('should show correct breadcrumb depending on initial state and changing it', () => {
      createDialog.open();

      // initial root
      createDialog.checkPath(['Adressen']);

      // change location in dialog
      createDialog.changeLocation('Testadressen');

      createDialog.checkPath(['Adressen', 'Testadressen']);

      // reopen dialog should show root again
      createDialog.cancel();
      createDialog.open();
      createDialog.checkPath(['Adressen']);

      // click on folder before open dialog
      createDialog.cancel();
      Tree.openNode(['Neue Testadressen']);
      createDialog.open();
      createDialog.checkPath(['Adressen', 'Neue Testadressen']);
    });

    it('should create a root address', () => {
      cy.get(DocumentPage.Toolbar.NewDoc).click();

      cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(`Adressen`);
      cy.get('[data-cy=create-action]').should('be.disabled');

      AddressPage.addOrganizationName('Ich AG');

      cy.get('[data-cy=create-action]').click();

      cy.get('.title').should('contain', 'Ich AG');
    });

    it('should create an address folder', () => {
      const folderName = 'Adressen Ordner' + Utils.randomString();

      AddressPage.createFolder(folderName);

      Tree.openNode([folderName]);
      cy.get(DocumentPage.title).should('have.text', folderName);
    });

    it('should generate a title from create parameters', () => {
      // only organization
      AddressPage.createAddress(new Address('Meine Organisation', '', ''));
      Tree.containsNodeWithFolderTitle('Meine Organisation');

      // organization + names
      AddressPage.createAddress(new Address('Anton', 'Riese', 'Meine Organisation'));
      Tree.containsNodeWithFolderTitle('Meine Organisation');
    });

    it('should apply initially selected item when switching location for a new folder', () => {
      // #1687

      let folderName = 'newFolder';
      // create a new folder/doc/address
      Tree.openNode(['Neue Testadressen']);
      cy.get(DocumentPage.Toolbar.NewFolder).click();
      createDialog.checkPath(['Adressen', 'Neue Testadressen']);

      // switch location
      cy.get('[data-cy=create-changeLocation]').click();

      // click 'Übernehmen' without changing the location
      cy.get('[data-cy=create-applyLocation]').click();

      // create the folder
      cy.get('[data-cy=create-title]').type(folderName);
      cy.get('[data-cy=create-action]').click();
    });

    it('should create an organization', () => {
      AddressPage.createAddress(new Address('NewOrg', '', ''));
      cy.get(DocumentPage.title).should('have.text', 'NewOrg');
      // check Organisation input
      cy.get('.organization input').should('have.value', 'NewOrg');
    });
  });

  describe('Publish addresses', () => {
    it('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      AddressPage.createAddress(new Address('publishErrorTest'));

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      AddressPage.publishIsUnsuccessful();

      cy.get('[data-cy="Kontakt"]').contains('Bitte erstellen Sie mindestens einen Eintrag');
    });

    it('should withdraw publication of published address', () => {
      const json = {
        organization: 'Thessalien, Adresse',
        title: 'Thessalien, Adresse',
        _type: 'McloudAddressDoc',
        contact: [{ type: 1, connection: '0123456789' }]
      };

      // create published address via api
      AddressPage.apiCreateAddress(json, true);
      cy.reload();
      // open address and withdraw publication
      Tree.openNode(['Thessalien, Adresse']);
      DocumentPage.choosePublishOption(PublishOptions.Unpublish);
      cy.contains('mat-dialog-container', 'Veröffentlichung zurückziehen');
      cy.contains('button', 'Zurückziehen').click();
      // check header
      cy.get('.title mat-icon.working').should('exist');
      AddressPage.openUpDocumentHeader();
      AddressPage.verifyInfoInDocumentHeader(headerElements.Status, 'In Bearbeitung');
      AddressPage.verifyInfoInDocumentHeader(
        headerElements.EditDate,
        Utils.getFormattedDate(new Date()) + ' von ' + 'Andre Wallat'
      );
    });

    xit('should not be able to withdraw publication of published address which is referenced in published or pending documents', () => {});
  });

  describe('Dirty checks', () => {
    it('should show a dialog when an address was modified and another address was clicked', () => {
      const adr1Name = 'Neue Testadressen';
      const adr2Name = 'Orga-Test';

      AddressPage.createAddress(new Address(adr2Name));
      AddressPage.addStreetName();

      // reject dialog
      // check selected tree node === previous selected node
      cy.wait(500);
      cy.get('#sidebar').findByText(adr1Name).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-cancel]').click();
      cy.get(DocumentPage.title).should('have.text', adr2Name);

      // accept dialog
      // check selected tree node === newly selected node
      cy.wait(500);
      cy.get('#sidebar').findByText(adr1Name).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-save]').click();
      cy.get(DocumentPage.title).should('have.text', adr1Name);
    });

    it('should check address header information', () => {
      let newOrgName = 'Burgenland, Adresse-modified';
      Tree.openNode(['Neue Testadressen', 'Burgenland, Adresse']);

      AddressPage.editOrganizationName(newOrgName);
      AddressPage.saveChangesOfProfile(newOrgName);

      // check that last-edited date has been updated
      const dateOfToday = Utils.getFormattedDate(new Date());
      AddressPage.checkHeaderInformation(dateOfToday);
    });

    it('should show a dialog when an address was modified and the page was changed', () => {
      const addressName = 'Testorganisation';

      cy.get('#sidebar').findByText('Testadressen').click();
      cy.get('#sidebar').findByText(addressName).click();
      AddressPage.addStreetName();

      // TODO find out why clicking too fast does not open dialog
      // reject -> should stay on page
      cy.wait(500);
      Menu.switchTo('DASHBOARD', false);
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-stay]').click();

      cy.get(DocumentPage.title).should('have.text', addressName);

      // accept (don't safe) -> should load new page
      cy.wait(500);
      Menu.switchTo('DASHBOARD', false);
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-leave]').click();

      cy.get(DocumentPage.title).should('not.exist');
    });

    it('should behave correctly after deleting subfolder (#2929)', () => {
      // create folder
      const folderName = 'folder_to_be_deleted';
      AddressPage.createFolder(folderName);

      cy.get(DocumentPage.title).should('have.text', folderName);

      // move folder to another folder (as subfolder)
      CopyCutUtils.dragdropWithoutAutoExpand(folderName, 'testordner_1', true);
      // check if document is moved
      Tree.openNode(['testordner_1', folderName]);

      // delete the subfolder
      AddressPage.deleteLoadedNode();

      // check if parent folder can be deleted
      Tree.openNode(['testordner_1']);
      cy.get('[data-cy="toolbar_DELETE"]').should('be.enabled').click();
      cy.contains('mat-dialog-container', 'Möchten Sie wirklich diese Datensätze löschen:');
    });

    it('should actualize tree after deleting (#3048)', () => {
      // create folder
      const folderName = 'leerer_Ordner_3';
      const addressName = 'Adresse, Friesland';
      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_C', folderName]);

      // delete the folder
      AddressPage.deleteLoadedNode();

      // check if folder has been deleted and is not visible anymore
      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_C']);
      cy.contains('mat-tree-node', folderName).should('not.exist');

      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_C', addressName]);

      // delete the address
      AddressPage.deleteLoadedNode();

      // check if address has been deleted and is not visible anymore
      Tree.openNode(['Neue Testadressen', 'Ordner_2.Ebene_C']);
      cy.contains('mat-tree-node', addressName).should('not.exist');
    });

    it('check for ordering and sorting "Kontakt" lists in the address document (organization)', () => {
      let contact1 = 'user@test.com';
      let contact2 = '1243543436';
      let resourceDateSelector = '[data-cy=Kontakt] ige-repeat .cdk-drag:nth-child(2) .cdk-drag-handle';
      let targetSelector = '[data-cy=Kontakt] ige-repeat .cdk-drag:nth-child(1)';

      Tree.openNode(['mclould_address']);

      DocumentPage.dragItem(resourceDateSelector, targetSelector);

      DocumentPage.saveDocument();

      // reload and make sure of ordering
      cy.reload();
      cy.get('[data-cy=Kontakt]', { timeout: 10000 }).should('exist');

      DocumentPage.checkOfExistingItem('[data-cy=Kontakt] ige-repeat .mat-input-element', contact2, 0, true);
      DocumentPage.checkOfExistingItem('[data-cy=Kontakt] ige-repeat .mat-input-element', contact1, 1, true);
    });
  });
});
