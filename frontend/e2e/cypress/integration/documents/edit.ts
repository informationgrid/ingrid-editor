import { DocumentPage, PublishOptions } from '../../pages/document.page';
import { AddressPage } from '../../pages/address.page';
import { Tree } from '../../pages/tree.partial';
import { Menu } from '../../pages/menu';
import { Utils } from '../../pages/utils';
import { AdminUserPage } from '../../pages/administration-user.page';
import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';

describe('mCLOUD: edit documents', function () {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    DocumentPage.visit();
  });

  describe('Plan Publishing of documents', () => {
    it('should plan publishing of document and reverse it (#3562)', () => {
      const publishDate = Utils.getFormattedDate(new Date(Date.now() + Utils.MILLISECONDS_IN_DAY));
      Tree.openNode(['TestDocResearch3']);
      DocumentPage.planPublishing(publishDate);
      // stop planned publishing
      cy.get('.publish-pending-info button').click();
      cy.contains('ige-form-message', 'geplante Veröffentlichung wurde abgebrochen');
    });

    it('should plan publishing of document via dialog and reverse it (#3562)', () => {
      const publishDate = Utils.getFormattedDate(new Date(Date.now() + Utils.MILLISECONDS_IN_DAY));
      Tree.openNode(['TestDocResearch3']);
      DocumentPage.planPublishing(publishDate, true);
      // stop planned publishing
      cy.get('.publish-pending-info button').click();
      cy.contains('ige-form-message', 'geplante Veröffentlichung wurde abgebrochen');
    });

    it('should plan publishing of document only for valid dates in the future (#3562)', () => {
      const wrongDate_1 = '03.03.2021';
      const wrongDate_2 = 'abc';
      const wrongDate_3 = '02.03.2';
      const wrongDate_4 = Utils.getFormattedDate(new Date());
      Tree.openNode(['TestDocResearch3']);
      DocumentPage.choosePublishOption(PublishOptions.PlanPublish);
      cy.contains('button', 'Ok').should('be.disabled');
      DocumentPage.fillInPublishingDate(wrongDate_1);
      cy.contains('button', 'Ok').should('be.disabled');
      DocumentPage.fillInPublishingDate(wrongDate_2);
      cy.contains('button', 'Ok').should('be.disabled');
      DocumentPage.fillInPublishingDate(wrongDate_3);
      cy.contains('button', 'Ok').should('be.disabled');
      DocumentPage.fillInPublishingDate(wrongDate_4);
      cy.contains('button', 'Ok').should('be.disabled');
    });

    it('document that is planned to be published should not be able to be edited, saved or published (#3562)', () => {
      Tree.openNode(['Neue Testdokumente', 'Datum_Ebene_2_4']);

      // planned publish info should be visible
      cy.get('.publish-pending-info').should('be.visible');
      // text fields are disabled
      cy.get('textarea').each(el => {
        cy.wrap(el).should('be.disabled');
      });
      // spatial reference cannot be added
      cy.get('[data-cy="spatialButton"]').should('not.exist');
      // downloads table cannot be changed
      cy.get('[data-cy="Downloads-table"] button').should('not.exist');
      // connected address cannot be edited
      cy.get('ige-address-card button').click();
      cy.get('.mat-menu-content button').eq(0).should('be.disabled');
      // document cannot be saved
      cy.get('[data-cy="toolbar_SAVE"]').should('be.disabled');
      // document cannot be published
      cy.get('[data-cy="toolbar_PUBLISH"]').should('be.disabled');
    });

    it('should not be possible to stop planned publishing if user has read-only access (#3562)', () => {
      // assign groups with read-only access to document
      Menu.switchTo('USERS');
      AdminUserPage.selectUser('mcloud-author-without-group');
      AdminUserPage.addGroupToUser('group_10');
      AdminUserPage.addGroupToUser('test_gruppe_5');
      AdminUserPage.saveUser();
      // log in as user that is assigned read-only access
      cy.logoutClearCookies();
      cy.kcLogin('mcloud-author-without-group');
      // open document
      DocumentPage.visit();
      Tree.openNode(['Datum_Ebene_2_3']);
      // information banner about planned publishing should be there, but no button to stop it
      cy.get('ige-publish-pending').should('exist');
      cy.get('.publish-pending-info button').should('not.exist');
    });
  });
});

describe('edit documents', function () {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    DocumentPage.visit();
  });

  xit('Should create minimal publishable document', () => {
    const docName = 'Testdokument_2';
    Tree.openNode(['Testdokumente', docName]);
    DocumentPage.fillInField('[data-cy="Textfeld"]', 'input', 'some text');
    DocumentPage.fillInField('[data-cy="Textfeld Max Länge"]', 'input', '5');
    DocumentPage.fillInField('[data-cy="Textarea"]', 'textarea', 'some more text');
    DocumentPage.chooseSelect('[data-cy="Selectbox"]', 'mat-select', 'Fachaufgabe');
    DocumentPage.chooseSelect('[data-cy="Selectbox mit leerer Option"]', 'mat-select', 'Fachaufgabe');
    DocumentPage.fillInField('[data-cy="Combobox/Autocomplete"]', 'input', 'Andere offene Lizenz');
    DocumentPage.fillInField('[data-cy="Date"]', 'input', '02.12.2021');
    DocumentPage.fillInField('[data-cy="Date-Range"]', 'input[formcontrolname="start"]', '12.12.2021');
    DocumentPage.fillInField('[data-cy="Date-Range"]', 'input[formcontrolname="end"]', '24.12.2021');
    DocumentPage.checkOption('[Data-cy="Checkbox"]');
    AddressPage.addAddressToTestDocument(['address_for_export'], 'Ansprechpartner');
    DocumentPage.setChips('DE_42/83 / GK_3');
    DocumentPage.fillInFieldWithEnter('[data-cy="Chips (Input)"]', 'input', 'chips', 'mat-chip .label');
    DocumentPage.fillInField('[data-cy="Multi-Repeat"]', 'formly-field-mat-input input', 'chips');
    DocumentPage.fillInField('[data-cy="Multi-Repeat"]', 'formly-field-mat-datepicker input', '12.11.2020');
    // upload file
    enterMcloudDocTestData.openDownloadDialog();
    enterMcloudDocTestData.uploadFile('importtest_3.json');
    DocumentPage.fillInFieldWithEnter('[data-cy="Mehrfacheingabe (Simple)"]', 'input', 'stuff', '.list-item');
    DocumentPage.addList('[data-cy="Image List"]', 'image title');
    DocumentPage.addList('[data-cy="Link List"]', 'sometitle', true);
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information', 'Bonn', false);

    // publish
    DocumentPage.publishNow();
  });
});
