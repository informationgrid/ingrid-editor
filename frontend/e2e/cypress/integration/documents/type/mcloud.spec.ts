import {DocumentPage} from "../../../pages/document.page";

describe('mCLOUD documents', function () {
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

    xit('should create a minimal publishable document', () => {
    });

    xit('should create a complete mcloud document', () => {
    });

  });
});
