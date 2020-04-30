import {DocumentPage} from './document.page';

export class AddressPage extends DocumentPage {
  /*static title = DocumentPage.title;

  static Toolbar = DocumentPage.Toolbar;
*/
  static visit() {
    cy.visit('address');
  }

  /*static createAddress(): string {
    const docName = 'Test-Adresse ' + Utils.randomString();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    cy.get('[data-cy=create-title]').type(docName);
    cy.get('[data-cy=create-action]').click();
    return docName;
  }

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
