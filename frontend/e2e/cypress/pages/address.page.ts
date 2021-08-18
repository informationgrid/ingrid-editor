import { DocumentPage, SEPARATOR } from './document.page';
import { Tree } from './tree.partial';
import { Utils } from './utils';

export class Address {
  constructor(public firstName?: string, public lastName?: string, public organization?: string) {}
}
export const ROOT = `Adressen`;

export class AddressPage extends DocumentPage {
  static CreateDialog = class extends DocumentPage.CreateDialog {
    static fill(address: Address, targetTreePath: string[] = ['Adressen']) {
      AddressPage.type('create-address-firstName', address.firstName);
      AddressPage.type('create-address-lastName', address.lastName);
      AddressPage.type('create-address-organization', address.organization);

      if (targetTreePath[0] == 'Adressen') {
        cy.get('[data-cy=create-changeLocation]').click();
        cy.get('ige-destination-selection mat-list-option').click();
        //check if 'Adressen' is chosen
        cy.get('[aria-selected=true]').contains('Adressen');
        cy.get('[data-cy=create-applyLocation]').click();
      } else {
        DocumentPage.changeLocation(targetTreePath);
      }
    }
  };

  static visit() {
    cy.visit('address');
  }

  static addContact(chooseContact: string, connectionField: string = 'Verbindung') {
    cy.get('[data-cy=create-action]').should('not.exist');
    cy.get('[data-cy=Kontakt]').find('ige-add-button').contains('Hinzufügen').click();
    cy.get('[data-cy=Kontakt]').contains('mat-select-arrow').click();
    cy.get('mat-option').contains(chooseContact).click();
    cy.get('[data-cy=Kontakt] input').type(connectionField);
  }

  static createAddress(address: Address, targetTreePath?: string[]) {
    this.CreateDialog.open();
    this.CreateDialog.fill(address, targetTreePath);
    this.CreateDialog.execute();
  }

  static apiCreateAddress(json: any, published?: boolean) {
    cy.request('POST', Cypress.config('baseUrl') + `/api/datasets?address=true&publish=${published}`, json);
  }

  static saveChanges() {
    cy.get('.mat-dialog-title').contains('Änderungen speichern?');
    cy.get('[data-cy=confirm-dialog-save]').click();
  }

  static discardSaveChanges() {
    cy.get('.mat-dialog-title').contains('Änderungen speichern?');
    cy.get('[data-cy=confirm-dialog-discard]').click();
  }

  static cancelSaveChanges() {
    cy.get('.mat-dialog-title').contains('Änderungen speichern?');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  }

  static publishNow() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(100);
    cy.get('[data-cy=toolbar_publish_now]').click();
    cy.get('[data-cy=confirm-dialog-confirm]').click();
    cy.get('[data-cy="form-message"]').contains('Das Dokument wurde veröffentlicht.');
  }

  static publishIsUnsuccessful() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(100);
    cy.get('[data-cy=toolbar_publish_now]').click();
    cy.hasErrorDialog('Es müssen alle Felder korrekt');
    cy.get('[data-cy="error-dialog-close"]').click();
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
