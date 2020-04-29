import {Utils} from './utils';

export class DocumentPage {
  static title = '.form-info-bar .title .label';

  static Toolbar = {
    NewDoc: '[data-cy=toolbar_NEW_DOC]',
    NewFolder: '[data-cy=toolbar_CREATE_FOLDER]',
    Save: '[data-cy=toolbar_SAVE]',
    Publish: '[data-cy=toolbar_PUBLISH]'
  }

  static visit() {
    cy.visit('form');
  }

  static createDocument(): string {
    const docName = 'Test-Dokument ' + Utils.randomString();
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
  }
}
