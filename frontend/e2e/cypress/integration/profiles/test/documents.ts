import { DocumentPage, headerElements, PublishOptions } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Address, AddressPage, addressType } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';

describe('test catalog addresses', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    DocumentPage.visit();
  });

  it('Should not  be possible to add same address with same type more than once #3652', () => {
    const docname = 'document_to_check_for_duplicate_address';
    const addressName = 'address_to_add_twice';
    Tree.openNode([docname]);
    enterMcloudDocTestData.setAddress(addressName);
    // try to add the same address again
    enterMcloudDocTestData.setAddress(addressName);
    cy.get('simple-snack-bar').contains('Die Adresse ist bereits vorhanden');
  });

  it('Should create minimal publishable document', () => {
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
