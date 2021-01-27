import { DocumentPage } from '../../pages/document.page';
import { Utils } from '../../pages/utils';
import { Address, AddressPage } from '../../pages/address.page';
import { Tree } from '../../pages/tree.partial';

describe('General create addresses/folders', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    AddressPage.visit();
  });

  afterEach(() => {
    cy.kcLogout();
  });

  const createDialog = AddressPage.CreateDialog;

  describe('Create Folder', () => {
    xit('should show all nested folders after creation when root parent is collapsed and expanded', () => {
      // create root folder "Nested"
      // create another folder under "Nested" with name "More nested"
      // create another folder under "More nested" with name "Even more nested"
      // collapse "Nested"
      // expand "Nested" and "More nested"
      // assert that directory "Even more nested" exists
    });
  });

  describe('Create Addresses', () => {
    it('should allow creation if one of firstname, lastname or organization was filled', () => {
      createDialog.open();
      cy.get('[data-cy=create-action]').should('be.disabled');

      createDialog.fill(new Address('Thomas'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      createDialog.fill(new Address('', 'Herbst'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      createDialog.fill(new Address('', '', 'Ich AG'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      createDialog.fill(new Address('', '', ''));
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

      cy.get('[data-cy=create-address-firstName]').type('Herbert');
      cy.get('[data-cy=create-address-lastName]').type('Meier');
      cy.get('[data-cy=create-address-organization]').type('Ich AG');

      cy.get('[data-cy=create-action]').click();

      cy.get('.firstName input').should('have.value', 'Herbert');
      cy.get('.lastName input').should('have.value', 'Meier');
    });

    it('should create an address folder', () => {
      const folderName = 'Adressen Ordner' + Utils.randomString();

      AddressPage.createFolder(folderName);

      Tree.openNode([folderName]);
      cy.get(DocumentPage.title).should('have.text', folderName);
    });

    it('should generate a title from create parameters', () => {
      // only first name and last name
      AddressPage.createAddress(new Address('Anton', 'Riese'));
      Tree.containsNodeWithTitle('Riese, Anton');

      // only organization
      AddressPage.createAddress(new Address('', '', 'Meine Organisation'));
      Tree.containsNodeWithTitle('Meine Organisation');

      // all
      AddressPage.createAddress(new Address('Anton', 'Riese', 'Meine Organisation'));
      Tree.containsNodeWithTitle('Meine Organisation, Riese, Anton');
    });

    xit('should apply initially selected item when switching location for a new folder', () => {
      // #1687
      // create a new folder/doc/address
      // switch location
      // click 'Übernehmen' without changing the location
      // -> error
    });

    xit('should create an organization', () => {});
  });

  describe('Publish addresses', () => {
    it('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      AddressPage.createAddress(new Address('publishErrorTest'));

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      AddressPage.publishIsUnsuccessful();

      cy.get('[data-cy="Kontakt"]').contains('Bitte erstellen Sie mindestens einen Eintrag');
      AddressPage.deleteLoadedNode();
    });
  });

  describe('Dirty checks', () => {
    it('should show a dialog when an address was modified and another address was clicked', () => {
      const adr1Name = 'Neue Testadressen';
      const adr2Name = 'Orga-Test';

      cy.get(DocumentPage.Toolbar.NewDoc).click();
      cy.get('[data-cy=create-address-organization]').type(adr2Name);
      cy.get('[data-cy=create-action]').click();
      cy.get('[data-cy=create-action]').should('not.exist');

      cy.get('.lastName ').type('testestest');

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

    it('should show a dialog when an address was modified and the page was changed', () => {
      const addressName = 'Testorganisation';

      cy.get('#sidebar').findByText('Testadressen').click();
      cy.get('#sidebar').findByText(addressName).click();
      cy.get('.lastName ').type('testestest');

      // TODO find out why clicking too fast does not open dialog
      // reject -> should stay on page
      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-stay]').click();

      cy.get(DocumentPage.title).should('have.text', addressName);

      // accept (don't safe) -> should load new page
      cy.wait(500);
      cy.get(DocumentPage.Sidemenu.Uebersicht).click();
      cy.get('.mat-dialog-title').contains('Änderungen speichern?');
      cy.get('[data-cy=confirm-dialog-leave]').click();

      cy.get(DocumentPage.title).should('not.exist');
    });
  });
});
