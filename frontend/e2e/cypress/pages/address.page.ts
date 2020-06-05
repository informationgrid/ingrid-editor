import {DocumentPage, SEPARATOR} from './document.page';
import {Tree} from './tree.partial';

export class Address {
  constructor(public firstName?: string, public lastName?: string, public organization?: string) {
  }
}

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

  /*
    static publishNow() {
      cy.get(DocumentPage.Toolbar.Publish).click();
      cy.get('[data-cy=toolbar_publish_now]').click();
    }

    static publishLater() {
      cy.get(DocumentPage.Toolbar.Publish).click();
      cy.get('[data-cy=toolbar_publish_later]').click();
    }

    static publishRevert() {
      cy.get(DocumentPage.Toolbar.Publish).click();
      cy.get('[data-cy=toolbar_publish_revert]').click();
    }*/
}
