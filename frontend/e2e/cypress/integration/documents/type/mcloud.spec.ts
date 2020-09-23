import {DocumentPage} from '../../../pages/document.page';
import {AddressPage} from "../../../pages/address.page";
import {Tree} from "../../../pages/tree.partial";

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
      const publishedAddress = 'Published Testorga';
      const docName = 'mCloudDoc1';

      cy.visit('/address')
      AddressPage.createAddressAndPublish(publishedAddress,'E-Mail');

      cy.visit('form')
      DocumentPage.createDocument(docName);
      // cy.visit('/form;id=642b8dde-96a9-4b1f-a2eb-e8894735f4cd');

      cy.get('[data-cy=Beschreibung]').find('mat-form-field').type('Testbeschreibung');

      cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
      DocumentPage.AddAddressDialog.searchAndAdd(publishedAddress, 'Herausgeber');
      cy.get('[data-cy=Adressen]').contains(publishedAddress);

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

    it('should create a complete mcloud document', () => {
      const publishedAddress = 'Published Testorga';
      const docName = 'mCloudfullDoc1';

      cy.get('#sidebar').contains(docName).click();

      DocumentPage.createDocument(docName);
      cy.get('ige-header-navigation').contains('mCLOUD'); //check if created document is a mCloud-Document

      cy.get('[data-cy=Beschreibung]').find('mat-form-field').type('Testbeschreibung, die zweite');

      cy.get('[data-cy=Adressen]').contains('Hinzufügen').click();
      DocumentPage.AddAddressDialog.searchAndAdd(publishedAddress, 'Herausgeber');
      cy.get('[data-cy=Adressen]').contains(publishedAddress);

      cy.get('[data-cy=Nutzungshinweise]').find('mat-form-field').type('Tippe Nutzungshinweise');

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

      cy.get('[data-cy=Quellenvermerk]').find('mat-form-field').type('copy&paste');

      cy.get('[data-cy=mFUND]').contains('mFUND Projekt').parents('.mat-form-field').type('einseins');
      cy.get('[data-cy=mFUND]').contains('mFUND Förderkennzeichen').parents('.mat-form-field').type('zweizwei');

      cy.get('[data-cy=spatialButton]').click();
      cy.get('[data-cy=spatial-dialog-title]').clear().type('Spaaaaatiaaal')
      cy.get('[data-cy=spatial-dialog-type]').contains('Frei');
      cy.get('[data-cy=spatial-dialog-free]').type('Bremen').then(() => {
        cy.get('mat-list :first-child').contains('Bremen').click();});
      cy.get('[data-cy=confirm-dialog-save]').click();

      cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Hinzufügen').click();
      cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Datum').parents('.mat-form-field').type('23.9.2020');
      cy.get('[data-cy="Zeitbezug der Ressource"]').contains('Typ').parents('.mat-form-field').click();
      cy.get('.mat-option-text').contains('Erstellung').click();

      cy.get('[data-cy=Zeitspanne]').contains('Wählen').click();
      cy.get('.mat-option-text').contains('am').click();
      cy.get('[data-cy=Zeitspanne] > .display-flex').type('23.9.2020');

      cy.get('[data-cy=Periodizität').find('mat-form-field').click();
      cy.get('mat-option').contains('einmalig').click();

      cy.get('[data-cy=toolbar_SAVE]').click();
      cy.get('[data-cy="form-message"]').contains('gespeichert');
    });

  });
});
