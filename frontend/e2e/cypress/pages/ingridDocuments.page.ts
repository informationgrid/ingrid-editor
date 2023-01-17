import { DocumentPage } from './document.page';
import { UvpDocumentPage } from './uvpDocument.page';

export class ingridDocumentPage {
  static setDescription(areaID: string, text: string) {
    cy.get(`${areaID}`).clear({ force: true }).type(text);
    cy.get(`${areaID}`).should('have.value', text);
  }

  static addNewField(identifier: string) {
    cy.get(`${identifier} ige-add-button`).click({ force: true });
  }

  static setSpatialBbox(title: string, locationText: string, typeOption: boolean = true) {
    cy.get('[data-cy=spatialButton]').click({ force: true });
    UvpDocumentPage.setOpenedSpatialBbox(title, locationText, typeOption);
    cy.contains('.spatial-title', locationText);
  }

  static fillInFieldWithEnter(identifier: string, fieldType: string, value: string, newPosition: string) {
    cy.get(`${identifier} ${fieldType}`).type(value + '{enter}', { force: true });
    cy.get(`${identifier} ${newPosition}`).should('contain', value);
  }

  static chooseSelect(identifier: string, fieldType: string, value: string, newPosition?: string) {
    cy.get(`${identifier} ${fieldType}`).first().click({ force: true });
    cy.contains('mat-option', value).click({ force: true });

    newPosition ? cy.contains(`${identifier} ${newPosition}`, value) : cy.contains(`${identifier} ${fieldType}`, value);
  }

  static fillInField(identifier: string, fieldType: string, value: string) {
    cy.get(`${identifier} ${fieldType}`).clear({ force: true }).type(value);
    cy.get(`${identifier} ${fieldType}`).should('have.value', value);
  }

  static setChips(identifier: string, text: string) {
    cy.get(`${identifier} ige-add-button mat-icon`).click({ force: true });
    cy.contains('[data-cy="chip-dialog-option-list"] .mat-list-item', text).click();
    cy.get('[data-cy="chip-dialog-confirm"]').click();
    cy.contains(`${identifier} .mat-chip`, text);
  }

  static setAddress(addressText: string, assignTo: string) {
    cy.get('[data-cy="pointOfContact"]').contains('Hinzufügen').click({ force: true });
    DocumentPage.AddAddressDialog.searchAndSelect(addressText);
    cy.get('[data-cy="choose-address-next-step"]').click();
    cy.contains('.card-title', assignTo).click();
    cy.get('[data-cy="choose-address-confirm"]').click();
  }

  static selectDataRepresentationOption(option: string) {
    // TODO
    // remove force from click
    cy.get('[data-cy="Dargestellte Daten"]  button ').contains('Hinzufügen').click({ force: true });
    cy.get('button ').contains(option).click();
  }

  static searchAndSelectGeoDataSet(documentName: string) {
    // TODO
    // refactor the code to be global
    cy.get('mat-dialog-content [data-cy="tree-search-field"]', { timeout: 6000 })
      .findByPlaceholderText('Suchen')
      .click({ force: true });
    cy.get('mat-dialog-content [data-cy="tree-search-field"]').findByPlaceholderText('Suchen').type(documentName);
    cy.wait(1000);
    cy.contains('ige-document-list-item', documentName, { timeout: 8000 }).click();
    cy.contains('button', 'Übernehmen').click();
  }

  static checkForGeoDataServiceReference(documentName: string) {
    cy.get('[data-cy="Darstellender Dienst"] ').contains(documentName);
  }
}
