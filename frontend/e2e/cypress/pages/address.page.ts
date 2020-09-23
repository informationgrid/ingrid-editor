import {DocumentPage, SEPARATOR} from './document.page';
import {Tree} from './tree.partial';
import {Utils} from "./utils";

export class Address {
  constructor(public firstName?: string, public lastName?: string, public organization?: string) {
  }
}
export const ROOT = `Adressen`;

export class AddressPage extends DocumentPage {

  static CreateDialog = class extends DocumentPage.CreateDialog {

    static fill(address: Address, location?: string) {
      AddressPage.type('create-address-firstName', address.firstName);
      AddressPage.type('create-address-lastName', address.lastName);
      AddressPage.type('create-address-organization', address.organization);

      if (location) {
        // TODO: implement
      }
    }

  }

  static visit() {
    cy.visit('address');
  }

  static createAddress(address: Address, location?: string) {
    this.CreateDialog.open();
    this.CreateDialog.fill(address);
    this.CreateDialog.execute();
  }

  // TODO: make an API Request to create a new address/document, since we do not test the address creation here,
  //       but just need an address for another test. After an API-Request we should reload the tree to get the
  //       changes made in the database.
  static createAddressAndPublish (adrName: string, chooseContact: string) {
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    cy.get('[data-cy=create-address-organization]').type(adrName);
    cy.get('[data-cy=create-action]').click();
    cy.get('[data-cy=create-action]').should('not.be.visible');
    cy.get('[data-cy=Kommunikation]').find('ige-add-button').contains('Hinzufügen').click();
    cy.get('[data-cy=Kommunikation]').find('mat-select').click();
    cy.get('mat-option').contains(chooseContact).click();
    cy.get('[data-cy=Kommunikation] input').type('Test');
    cy.wait(500);
    AddressPage.publishNow();
    cy.get('[data-cy="form-message"]').contains('Das Dokument wurde veröffentlicht.');
  }

  static saveChanges () {
    cy.get('.mat-dialog-title').contains('Änderungen sichern?');
    cy.get('[data-cy=confirm-dialog-save]').click();
  }

  static discardSaveChanges () {
    cy.get('.mat-dialog-title').contains('Änderungen sichern?');
    cy.get('[data-cy=confirm-dialog-discard]').click();
  }

  static cancelSaveChanges () {
    cy.get('.mat-dialog-title').contains('Änderungen sichern?');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  }


  static publishNow() {
    cy.get('[data-cy=toolbar_publish_now]').click();
    cy.get('[data-cy=confirm-dialog-confirm]').click();
  }

  static publishLater() {
    cy.get(DocumentPage.Toolbar.Publish).click();
    cy.get('[data-cy=toolbar_publish_later]').click();
  }

  static publishRevert() {
    cy.get(DocumentPage.Toolbar.Publish).click();
    cy.get('[data-cy=toolbar_publish_revert]').click();
  }
}
