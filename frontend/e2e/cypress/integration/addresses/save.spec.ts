import {DocumentPage} from '../../pages/document.page';
import {Utils} from '../../pages/utils';
import {AddressPage} from '../../pages/address.page';

const SEPARATOR = ' chevron_right';

describe('General create addresses/folders', () => {

  beforeEach(() => {
    cy.kcLogin('user');
    AddressPage.visit();
  });

  describe('Create Addresses', () => {

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
        .should('be.enabled')
        .click();

      // Tree.containsNodeWithTitle(docName);
      cy.get('.firstName input').should('have.value', 'Herbert');
      cy.get('.lastName input').should('have.value', 'Meier');
    });

    xit('should generate a title from create parameters', () => {
      // only first name and last name

      // only organization

      // all
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
