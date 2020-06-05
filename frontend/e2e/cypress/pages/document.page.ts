import {Utils} from './utils';
import {BasePage} from './base.page';
import {Tree} from './tree.partial';

export const SEPARATOR = 'chevron_right';
export const ROOT = `Daten`;

export class DocumentPage extends BasePage {

  static CreateDialog = class {

    static open() {
      cy.get(DocumentPage.Toolbar.NewDoc).click();
    }

    static checkPath(path: string[]) {
      cy.get('mat-dialog-container ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    }

    static setLocation(nodeTitle: string) {
      cy.get('[data-cy=create-changeLocation]').click();
      Tree.selectNodeWithTitle(nodeTitle, true);
      cy.get('[data-cy=create-applyLocation]').click();
    }

    static execute() {
      cy.get('[data-cy=create-action]').click();
    }

    static cancel() {
      cy.get('[data-cy=dlg-close]').click();
      // cy.get('.dialog-title-wrapper button').click();
    }

  }

  static title = '.form-info-bar .title .label';

  static Toolbar: Record<string, string> = {
    NewDoc: '[data-cy=toolbar_NEW_DOC]',
    NewFolder: '[data-cy=toolbar_CREATE_FOLDER]',
    Preview: '[data-cy=toolbar_PRINT]',
    Copy: '[data-cy=toolbar_COPY]',
    Revert: '[data-cy=toolbar_REVERT]',
    Delete: '[data-cy=toolbar_DELETE]',
    Previous: '[data-cy=toolbar_HISTORY_PREVIOUS]',
    Next: '[data-cy=toolbar_HISTORY_NEXT]',
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

  static checkOnlyActiveToolbarButtons(buttonIds: string[]) {
    Object.keys(DocumentPage.Toolbar).forEach(key => {
      if (buttonIds.indexOf(key) !== -1) {
        cy.get(DocumentPage.Toolbar[key]).should('be.enabled');
      } else {
        cy.get(DocumentPage.Toolbar[key]).should('be.disabled');
      }
    })
  }
}
