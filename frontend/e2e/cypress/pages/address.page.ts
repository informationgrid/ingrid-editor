import { DocumentPage } from './document.page';
import { Utils } from './utils';
import { Tree } from './tree.partial';

export class Address {
  constructor(
    public organization = 'Organization' + Utils.randomString(),
    public firstName?: string,
    public lastName?: string
  ) {}
}

export const ROOT = `Adressen`;

export class AddressPage extends DocumentPage {
  static CreateDialog = class extends DocumentPage.CreateDialog {
    static fillOrganizationType(address: Address, targetTreePath: string[] = ['Adressen']) {
      AddressPage.type('create-address-organization', address.organization);

      if (targetTreePath.length > 0) {
        if (targetTreePath[0] == 'Adressen') {
          AddressPage.chooseRootInAddressCreateDialog();
        } else {
          DocumentPage.changeLocation(targetTreePath);
        }
      }
    }

    static fillPersonType(address: Address, targetTreePath: string[] = ['Adressen']) {
      AddressPage.type('create-address-firstName', address.firstName);
      AddressPage.type('create-address-lastName', address.lastName);

      if (targetTreePath.length > 0) {
        if (targetTreePath[0] == 'Adressen') {
          AddressPage.chooseRootInAddressCreateDialog();
        } else {
          DocumentPage.changeLocation(targetTreePath);
        }
      }
    }
  };

  static chooseRootInAddressCreateDialog() {
    cy.get('[data-cy=create-changeLocation]').click();
    cy.get('ige-destination-selection mat-list-option').click();
    //check if 'Adressen' is chosen
    cy.get('[aria-selected=true]').contains('Adressen');
    cy.get('[data-cy=create-applyLocation]').click();
  }

  static chooseAddressTypeInAddressCreateDialog(type: addressType) {
    cy.contains('mat-list-option', type).click();
  }

  static checkHeaderInformation(editDate: string) {
    cy.get('.title').within(_ => {
      cy.findByText('keyboard_arrow_down').click();
    });
    cy.get('ige-header-more').children().first().eq(0).contains('In Bearbeitung');
    cy.get('ige-header-more').children().contains('Adresse');
    cy.get('ige-header-more').children().last().contains(editDate);
  }

  static visit() {
    cy.intercept({ method: 'GET', url: 'api/tree/children?address=true', times: 1 }).as('treeCallAddress');
    cy.visit('address');
    cy.wait('@treeCallAddress', { timeout: 21000 });
  }

  // TODO: remove default values and call with specific parameters
  static addContact(chooseContact: string = 'Telefon', connection: string = '123456789', index: number = 0) {
    cy.get('[data-cy=create-action]').should('not.exist');
    cy.get('[data-cy=contact]').find('ige-add-button').contains('Hinzufügen').click();
    // TODO: replace with BasePage.selectOption() -> difficult since, there are more than one select boxes
    cy.get('[data-cy=contact]').find('.mat-select-arrow').eq(index).click();
    cy.get('mat-option').contains(chooseContact).click();
    cy.get('[data-cy=contact] ').find('input').eq(index).clear().type(connection);
  }

  static addAddressToTestDocument(path: string[], addressType: string) {
    cy.get('[data-cy=addresses]').contains('Hinzufügen').click();
    Tree.openNodeInsideDialog(path);
    cy.get('[data-cy=choose-address-next-step]', { timeout: 15000 }).click();
    this.selectOptionAsync('address-type-select', addressType);
    cy.contains('button', 'Übernehmen').click();
  }

  static deleteAddressFromTestDocument() {
    cy.get('ige-address-card button').click();
    cy.get('.mat-menu-content button').eq(2).click();
  }

  static addOrganizationName(name: string = 'Organization' + Utils.randomString()) {
    cy.get("[data-cy='create-address-organization']").type(name);
  }

  static editOrganizationName(name: string = 'Organization' + Utils.randomString()) {
    cy.get("[data-cy='organization'] input").clear().type(name);
  }

  static addStreetName(name: string = Utils.randomDoubleDigitString() + '. Street') {
    cy.get('[data-cy="address"] input').first().type(name);
  }

  static createAddress(address: Address, targetTreePath?: string[]) {
    this.CreateDialog.open();
    this.CreateDialog.fillOrganizationType(address, targetTreePath);
    cy.intercept({
      pathname: '/api/datasets',
      query: {
        address: 'true'
      },
      method: 'POST'
    }).as('setAddress');
    this.CreateDialog.execute();
    cy.wait('@setAddress');
  }

  static apiCreateAddress(json: any, published?: boolean) {
    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: Cypress.config('baseUrl') + `/api/datasets?address=true&publish=${published}`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static saveChanges() {
    cy.get('.mat-dialog-title').contains('Änderungen speichern?');
    cy.get('[data-cy=confirm-dialog-save]').click();
  }

  static saveChangesOfProfile(docTitle: string) {
    cy.intercept('PUT', /api\/datasets/).as('saveChanges');
    cy.get('[data-cy="toolbar_SAVE"]').click();
    cy.wait('@saveChanges').its('response.body.title').should('eq', docTitle);
  }

  static discardSaveChanges() {
    cy.get('.mat-dialog-title').contains('Änderungen speichern?');
    cy.get('[data-cy=confirm-dialog-discard]').click();
  }

  static cancelSaveChanges() {
    cy.get('.mat-dialog-title').contains('Änderungen speichern?');
    cy.get('[data-cy=confirm-dialog-cancel]').click();
  }

  static publishIsUnsuccessful() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(100);
    cy.get('[data-cy=toolbar_publish_now]').click();
    cy.hasErrorDialog('Es müssen alle Felder korrekt');
    cy.get('[data-cy="error-dialog-close"]').click();
  }

  static addTitleToProfile(title: string) {
    cy.get('.mat-form-field-outline.mat-form-field-outline').eq(11).next().find('.mat-select-arrow-wrapper').click();
    cy.get('[role="listbox"]').contains(title).click();
  }

  static deleteLoadedNode(tryToDelete: boolean = false) {
    cy.wait(300);
    cy.get(AddressPage.Toolbar['Delete']).click();
    if (tryToDelete) {
      cy.get('[data-cy="confirm-dialog-confirm"]').click();
    } else {
      cy.intercept('GET', /api\/datasetsByUuid/).as('deleteRequest');
      cy.get('[data-cy="confirm-dialog-confirm"]').click();
      cy.wait('@deleteRequest', { timeout: 10000 });
    }
  }
  static tryIllegitimatDelete() {
    cy.get(AddressPage.Toolbar['Delete']).click();
    cy.intercept('DELETE', /api\/datasets/).as('deleteRequest');
    cy.get('[data-cy="confirm-dialog-confirm"]').click();
    cy.wait('@deleteRequest', { timeout: 10000 });
  }

  static openReplaceAddressDialog() {
    cy.get('[data-cy=action-replace-address]').click();
  }

  static closeReplaceAddressDialog() {
    cy.get('ige-replace-address-dialog  .mat-dialog-title button').click();
  }

  static openActionMenu() {
    cy.get('[data-cy="more-actions"]').click();
  }

  static submitReplaceAddress() {
    cy.get('[data-cy="dialog-replace-address"]').click();
  }
  static openReferencedDocumentsSection() {
    cy.get('ige-referenced-documents-type button').click();
  }
}

export enum addressType {
  Organisation = 'Organisation',
  Person = 'Person'
}
