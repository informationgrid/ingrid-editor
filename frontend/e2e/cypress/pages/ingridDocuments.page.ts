import { DocumentPage } from './document.page';
import { UvpDocumentPage } from './uvpDocument.page';

export class ingridDocumentPage {
  static setDescription(areaID: string, text: string) {
    cy.get(`${areaID}`).clear({ force: true }).type(text);
    cy.get(`${areaID}`).should('have.value', text);
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
}
