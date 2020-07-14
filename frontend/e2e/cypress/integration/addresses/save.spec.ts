import {DocumentPage} from '../../pages/document.page';
import {Utils} from '../../pages/utils';
import {Address, AddressPage} from '../../pages/address.page';
import {Tree} from '../../pages/tree.partial';

describe('General create addresses/folders', () => {

  const dialog = AddressPage.CreateDialog;

  beforeEach(() => {
    cy.kcLogin('user');
    AddressPage.visit();
  });

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
      dialog.open();
      cy.get('[data-cy=create-action]').should('be.disabled');

      dialog.fill(new Address('Thomas'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      dialog.fill(new Address('', 'Herbst'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      dialog.fill(new Address('', '', 'Ich AG'));
      cy.get('[data-cy=create-action]').should('be.enabled');

      dialog.fill(new Address('', '', ''));
      cy.get('[data-cy=create-action]').should('be.disabled');
    });

    it('should show correct breadcrumb depending on initial state and changing it', () => {
      dialog.open();

      // initial root
      dialog.checkPath(['Adressen']);

      // change location in dialog
      dialog.setLocation('Testadressen');

      dialog.checkPath(['Adressen', 'Testadressen']);

      // reopen dialog should show root again
      dialog.cancel();
      dialog.open();
      dialog.checkPath(['Adressen']);

      // click on folder before open dialog
      dialog.cancel();
      Tree.selectNodeWithTitle('Neue Testadressen');
      dialog.open();
      dialog.checkPath(['Adressen', 'Neue Testadressen']);
    });

    it('should create a root address', () => {
      const docName = 'Root Test-Adresse ' + Utils.randomString();

      cy.get(DocumentPage.Toolbar.NewDoc).click();

      cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(`Adressen`);
      cy.get('[data-cy=create-action]').should('be.disabled');

      // cy.get('[data-cy=create-title]').type(docName);
      cy.get('[data-cy=create-address-firstName]').type('Herbert');
      cy.get('[data-cy=create-address-lastName]').type('Meier');
      cy.get('[data-cy=create-address-organization]').type('Ich AG');

      cy.get('[data-cy=create-action]')
        .click();

      cy.get('.firstName input').should('have.value', 'Herbert');
      cy.get('.lastName input').should('have.value', 'Meier');
    });

    xit('should create an address folder', () => {
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

    xit('should create an organization', () => {

    });

  });

  describe('Publish addresses', () => {
    xit('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      // AddressPage.createAddress();

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      AddressPage.publishNow();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });
  });

  describe('Dirty checks', () => {
    xit('should show a dialog when an address was modified and another address was clicked', () => {

      // reject dialog
      // check selected tree node === previous selected node

      // accept dialog
      // check selected tree node === newly selected node

    });

    xit('should show a dialog when an address was modified and the page was changed', () => {

      // reject -> should stay on page

      // accept -> should load new page

    });
  });
});
