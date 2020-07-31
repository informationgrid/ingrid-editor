import {DocumentPage} from '../../../pages/document.page';

describe('mCLOUD documents', function () {

  before(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  beforeEach(() => {
    DocumentPage.visit();
  });

  describe('Publish documents', () => {

    it('should show a validation error when a required field is not filled', () => {
      cy.get(DocumentPage.Toolbar.Publish).should('be.disabled');

      DocumentPage.createDocument();

      cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
      DocumentPage.publishNow();

      cy.hasErrorDialog('Es müssen alle Felder korrekt');

      // should show exactly x validation errors on the following fields

      cy.fieldIsInvalid('description', 'Dieses Feld muss ausgefüllt sein');
    });

    it('should create a minimal publishable document', () => {
      DocumentPage.createDocument();
      // cy.visit('/form;id=642b8dde-96a9-4b1f-a2eb-e8894735f4cd');

      cy.get('[data-cy=Beschreibung]').find('mat-form-field').type('Testbeschreibung');

      cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
      DocumentPage.AddAddressDialog.searchAndAdd('Testorganisation', 'Herausgeber');
      cy.get('[data-cy=Adressen]').contains('Testorganisation');

      cy.get('[data-cy="mCLOUD Kategorie"]').contains('Hinzufügen').click();
      cy.get('[data-cy="chip-dialog-option-list"]').contains('Bahn').click();
      cy.get('[data-cy="chip-dialog-confirm"]').click();

      cy.get('[data-cy="OpenData Kategorie"]').contains('Hinzufügen').click();
      cy.get('[data-cy="chip-dialog-option-list"]').contains('Verkehr').click();
      cy.get('[data-cy="chip-dialog-confirm"]').click();

      cy.get('[data-cy="Downloads-add"]').contains('Hinzufügen').click();
      cy.get('[data-cy="form-dialog-content"]').contains(' Link ').parent().parent().type('link.link');
      cy.get('[data-cy="form-dialog-content"]').contains('Typ ').parent().parent().type('linktyp');
      cy.get('[data-cy="form-dialog-confirm"]').click();

      cy.get('[data-cy=Lizenz] mat-form-field').click();
      cy.get('mat-option').contains('Andere offene Lizenz').click();
      cy.wait(500);
      DocumentPage.publishNow();
      cy.get('[data-cy="confirm-dialog-confirm"]').click();
      cy.get('[data-cy="form-message"]').contains('Das Dokument wurde veröffentlicht.')
    });

    xit('should create a complete mcloud document', () => {
    });

  });
});
