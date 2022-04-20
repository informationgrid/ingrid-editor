import { DocumentPage } from './document.page';
import { Utils } from './utils';
import { Tree } from './tree.partial';

export class uvpPage {
  static setDescription(text: string) {
    cy.get('[data-cy="Allgemeine Vorhabenbeschreibung"] textarea').type(text);
    cy.get('[data-cy="Allgemeine Vorhabenbeschreibung"] textarea').should('have.value', text);
  }

  static setDateOfRequest(date: string) {
    cy.get('[data-cy="Eingang des Antrags"] input').type(date);
    cy.get('[data-cy="Eingang des Antrags"] input').should('have.value', date);
  }

  static setDecisionDate(date: string) {
    cy.get('[data-cy="Datum der Entscheidung"] input').type(date);
    cy.get('[data-cy="Datum der Entscheidung"] input').should('have.value', date);
  }

  static IsPreliminaryAssessment(answer: 'Ja' | 'Nein') {
    cy.contains('[data-cy="Vorprüfung durchgeführt"] mat-radio-button', answer).within(_ =>
      cy.get('input').check({ force: true })
    );
    cy.get('[data-cy="Vorprüfung durchgeführt"] mat-radio-button').should('have.class', 'mat-radio-checked');
  }

  static setUVPnumber(UVPnumber: string) {
    cy.get('[data-cy="UVP-Nummern"] mat-select')
      .click()
      .type(UVPnumber + '{enter}');
    cy.get('[data-cy="UVP-Nummern"]').should('contain', UVPnumber);
    cy.get('[data-cy="UVP-Nummern"] mat-select').invoke('attr', 'aria-expanded').should('eq', 'false');
  }

  static setAddress(addressText: string) {
    cy.get('[data-cy="Kontaktdaten der verfahrensführenden Behörde"]').contains('Hinzufügen').click();
    DocumentPage.AddAddressDialog.searchAndSelect(addressText);
    cy.get('[data-cy="choose-address-confirm"]').click();
    cy.get('[data-cy="Kontaktdaten der verfahrensführenden Behörde"]').contains(addressText);
  }
}
