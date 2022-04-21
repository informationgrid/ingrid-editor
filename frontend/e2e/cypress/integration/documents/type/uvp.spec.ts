import { DocumentPage } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Address, AddressPage, addressType } from '../../../pages/address.page';
import { Tree } from '../../../pages/tree.partial';
import { Menu } from '../../../pages/menu';
import { AddressDetails, uvpPage } from '../../../pages/uvp.page';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { CopyCutUtils, CopyOption } from '../../../pages/copy-cut-utils';

describe('uvp documents', () => {
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

  it('create a minimal publishable document of type "Linienbestimmung" and publish it', () => {
    Tree.openNode(['Plan_L']);

    // add description
    uvpPage.setDescription('some description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_6');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Fulda', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('02.12.2021');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.1');
    // publish
    DocumentPage.publishNow();
  });

  it('create a minimal publishable document of type "Zulassungsverfahren" and publish it', () => {
    Tree.openNode(['Plan_Z']);

    // add description
    uvpPage.setDescription('some description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_7');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Fulda', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('03.12.2021');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.1');
    // was there a preliminary assessment?
    uvpPage.IsPreliminaryAssessment('Ja');
    // publish
    DocumentPage.publishNow();
  });

  it('create a minimal publishable document of type "Raumordnungsverfahren" and publish it', () => {
    Tree.openNode(['Plan_R']);

    // add description
    uvpPage.setDescription('some other description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_8');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Bonn', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('04.12.2021');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.1');
    // publish
    DocumentPage.publishNow();
  });

  it('create a minimal publishable document of type "Ausländisches Vorhaben" and publish it', () => {
    Tree.openNode(['Plan_A']);

    // add description
    uvpPage.setDescription('some more description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_9');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Olpe', false);
    // publish
    DocumentPage.publishNow();
  });

  it('create a minimal publishable document of type "Negative Vorprüfung" and publish it', () => {
    Tree.openNode(['Plan_N']);

    // add address
    uvpPage.setAddress('Adresse, Organisation_10');
    // add arrival date of request
    uvpPage.setDecisionDate('06.12.2021');
    // publish
    DocumentPage.publishNow();
  });

  it('address created under organisation should inherit its address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address('child_organization', '', ''), [
      'Adresse, Organisation_4'
    ]);
    cy.contains('button', 'Anlegen').click();
    // make sure that slide toggle that indicates inheritance of addresses is checked
    cy.get('[data-cy="Adresse"] mat-slide-toggle input').invoke('attr', 'aria-checked').should('eq', 'true');
  });

  it('address created under root should not inherit its address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    AddressPage.CreateDialog.fillOrganizationType(new Address('root_organization', '', ''));
    cy.contains('button', 'Anlegen').click();
    // make sure that slide toggle that indicates inheritance of addresses is not there
    cy.get('[data-cy="Adresse"] mat-slide-toggle').should('not.exist');
  });

  it('address created under folder should not inherit its address (#3743)', () => {
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
  it('an address of type organization moved under an organization should preserve its own address (#3743)', () => {
    Menu.switchTo('ADDRESSES');
    Tree.openNode(['Adresse, Organisation_4']);
    CopyCutUtils.move(['Organisation_12']);
    // make sure that slide toggle that indicates inheritance of addresses is not checked
    cy.get('[data-cy="Adresse"] mat-slide-toggle input').invoke('attr', 'aria-checked').should('eq', 'false');
  });

  // not working right now (21.04.22)
  it('an address of type person moved under an organization should preserve its own address (#3743)', () => {
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
    cy.contains('button', 'Ordner ändern').click();
    cy.contains('mat-dialog-content mat-tree mat-tree-node', parentAddress).should('have.class', 'disabled');
  });

  it('should not be possible to copy address of type person under another address of type person', () => {
    const parentAddress = 'Schneider, Fritz';
    Menu.switchTo('ADDRESSES');
    AddressPage.CreateDialog.open();
    cy.contains('button', 'Ordner ändern').click();
    cy.contains('mat-dialog-content mat-tree mat-tree-node', parentAddress).should('have.class', 'disabled');
  });

  it('should be possible to add individual address after inheriting the address of the higher-level entity', () => {
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
});
