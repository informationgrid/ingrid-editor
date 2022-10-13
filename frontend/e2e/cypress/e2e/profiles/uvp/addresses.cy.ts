import { DocumentPage, headerElements, PublishOptions } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Address, AddressPage, addressType } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { Menu } from '../../../pages/menu';
import { AddressDetails, UVPmetrics, uvpPage, UVPreports } from '../../../pages/uvp.page';
import { CopyCutUtils, CopyOption } from '../../../pages/copy-cut-utils';
import { AdminUserPage } from '../../../pages/administration-user.page';
import { UserAndRights } from '../../../pages/base.page';
import { AdminGroupPage } from '../../../pages/administration-group.page';

describe('uvp addresses', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    DocumentPage.visit();
  });

  it('should create a new address inside catalog of type uvp (type organization)', () => {
    const organization = 'orga' + Utils.randomString();

    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address(organization, '', ''), ['Adressen']);
    cy.contains('button', 'Anlegen').click();
    cy.contains('ige-tree', organization);
    cy.contains('.title', organization);
  });

  it('should create a new address inside catalog of type uvp (type person)', () => {
    const firstName = 'Michael' + Utils.randomString();
    const lastName = 'Kohlhaas';
    const title = `${lastName}, ${firstName}`;

    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.chooseAddressTypeInAddressCreateDialog(addressType.Person);
    AddressPage.CreateDialog.fillPersonType(new Address('', firstName, lastName), ['Adressen']);
    cy.contains('button', 'Anlegen').click();
    cy.contains('ige-tree', title);
    cy.contains('.title', title);
  });

  xit('address created under organisation should inherit its address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address('child_organization', '', ''), [
      'Adresse, Organisation_4'
    ]);
    cy.contains('button', 'Anlegen').click();
    // make sure that slide toggle that indicates inheritance of addresses is checked
    cy.get('[data-cy="Adresse"] mat-slide-toggle input').invoke('attr', 'aria-checked').should('eq', 'true');
  });

  xit('address created under root should not inherit its address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address('root_organization', '', ''));
    cy.contains('button', 'Anlegen').click();
    // make sure that slide toggle that indicates inheritance of addresses is not there
    cy.get('[data-cy="Adresse"] mat-slide-toggle').should('not.exist');
  });

  xit('address created under folder should not inherit its address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    // create address under a folder
    Tree.openNode(['address_folder_1']);
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address('sub_organization', '', ''));
    cy.contains('button', 'Anlegen').click();
    // make sure that slide toggle that indicates inheritance of addresses is not there
    cy.get('[data-cy="Adresse"] mat-slide-toggle').should('not.exist');
  });

  // not working right now (21.04.22)
  xit('an address of type organization moved under an organization should preserve its own address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    Tree.openNode(['Adresse, Organisation_4']);
    CopyCutUtils.move(['Organisation_12']);
    // make sure that slide toggle that indicates inheritance of addresses is not checked
    cy.get('[data-cy="Adresse"] mat-slide-toggle input').invoke('attr', 'aria-checked').should('eq', 'false');
  });

  // not working right now (21.04.22)
  xit('an address of type person moved under an organization should preserve its own address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    Tree.openNode(['Dude, Some']);
    CopyCutUtils.move(['Organisation_12']);
    // make sure that slide toggle that indicates inheritance of addresses is not checked
    cy.get('[data-cy="Adresse"] mat-slide-toggle input').invoke('attr', 'aria-checked').should('eq', 'false');
  });

  it('should not be possible to move address of type person under another address of type person', () => {
    const unmovableAddress = 'Huber, Hans';
    Menu.switchTo('ADDRESSES');
    // try to move by drag and drop
    CopyCutUtils.simpleDragdropWithoutAutoExpand(unmovableAddress, 'Schneider, Fritz');
    // if moving fails, there is no prompt to confirm the action
    cy.contains('mat-dialog-container', 'Verschieben bestätigen').should('not.exist');

    // try to move by menu
    Tree.openNode([unmovableAddress]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get(CopyOption.MOVE).click();
    cy.contains('mat-dialog-content mat-tree mat-tree-node', 'Schneider, Fritz').should('have.class', 'disabled');
  });

  it('should not be possible to create address of type person under another address of type person', () => {
    const parentAddress = 'Schneider, Fritz';
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    cy.contains('button', 'Zielordner ändern').click();
    cy.contains('mat-dialog-content mat-tree mat-tree-node', parentAddress).should('have.class', 'disabled');
  });

  it('should not be possible to copy address of type person under another address of type person', () => {
    const parentAddress = 'Schneider, Fritz';
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    cy.contains('button', 'Zielordner ändern').click();
    cy.contains('mat-dialog-content mat-tree mat-tree-node', parentAddress).should('have.class', 'disabled');
  });

  xit('should be possible to add individual address after inheriting the address of the higher-level entity', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address('child_organization_1', '', ''), ['Organisation_13']);
    cy.contains('button', 'Anlegen').click();
    // make sure that slide toggle that indicates inheritance of addresses is checked
    cy.get('[data-cy="Adresse"] mat-slide-toggle input').invoke('attr', 'aria-checked').should('eq', 'true');
    // uncheck slide toggle
    cy.get('[data-cy="Adresse"] .mat-slide-toggle-thumb').click();
    // add new address data
    uvpPage.addAddressElement(AddressDetails.Street, 'Waldstrasse');
    uvpPage.addAddressElement(AddressDetails.Zipcode, '54321');
    uvpPage.addAddressElement(AddressDetails.City, 'Köln');
    DocumentPage.saveDocument();
    // check that after saving the correct values are there
    uvpPage.checkAddressElement(AddressDetails.Street, 'Waldstrasse');
    uvpPage.checkAddressElement(AddressDetails.Zipcode, '54321');
    uvpPage.checkAddressElement(AddressDetails.City, 'Köln');
  });

  it('should not be allowed to delete Address if it is still referenced in data records. (#3767)', () => {
    Menu.switchTo('ADDRESSES');
    Tree.openNode(['Referenced Org']);
    AddressPage.deleteLoadedNode(true);
    cy.get('ige-replace-address-dialog').contains(
      'Diese Adresse wird von mindestens einem Verfahren referenziert. Möchten Sie die Adresse ersetzen?'
    );
  });

  it('should show one name on address card when address was created with only one name (first or last name)', () => {
    const addressFirstName = '';
    const addressLastName = 'lastName' + Utils.randomString();
    const addressData = {
      firstName: addressFirstName,
      lastName: addressLastName,
      title: addressLastName,
      _type: 'UvpAddressDoc'
    };
    AddressPage.apiCreateAddress(addressData, false);

    // add address to document and check address card
    Tree.openNode(['Plan_Ordner_3', 'Plan_L_2']);
    uvpPage.setAddress(addressLastName);
    cy.get('ige-address-card .title').then(addressTitle => {
      expect(addressTitle.text().trim()).to.equal(addressLastName);
    });
  });

  it('should show correct icons when adding addresses to permissions (#3767)', () => {
    const addressName = 'Bauer, Fred';
    const organizationName = 'Organisation_13';

    Menu.switchTo('USERS');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait('group_1');
    AdminGroupPage.addDocumentToGroup(addressName, 'Adressen');
    AdminGroupPage.addDocumentToGroup(organizationName, 'Adressen');
    cy.contains('permission-table tr', addressName).find('[data-mat-icon-name="Freie-Adresse"]');
    cy.contains('permission-table tr', organizationName).find('[data-mat-icon-name="Institution"]');
  });
});
