import { DocumentPage, headerElements, PublishOptions } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Address, AddressPage, addressType } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { Menu } from '../../../pages/menu';
import { AddressDetails, UVPmetrics, uvpPage, UVPreports } from '../../../pages/uvp.page';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { CopyCutUtils, CopyOption } from '../../../pages/copy-cut-utils';
import { ResearchPage } from '../../../pages/research.page';
import { BasePage } from '../../../pages/base.page';

describe('test catalog addresses', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('ige3').as('tokens');
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
});
