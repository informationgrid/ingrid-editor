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
      'Das Dokument wird bereits von mindestens einem Dokument referenziert. Möchten Sie die Adresse ersetzen?'
    );
  });

  it('should add a maximum one spatial reference (#3747) using JSON schema', () => {
    const docTitle = 'A_mit_2_Raumbezug_Json' + Utils.randomString();
    const spacial = [
      {
        value: {
          lat1: 49.006168881770996,
          lon1: 8.49272668361664,
          lat2: 49.006207590084536,
          lon2: 8.492801785469057
        },
        title:
          'Grötzingen, Eisenbahnstraße, Südlich der Pfinz, Grötzingen, Karlsruhe, Baden-Württemberg, 76229, Germany',
        type: 'free'
      },
      {
        value: {
          lat1: 49.516185347498016,
          lon1: 8.47526013851166,
          lat2: 49.5163420713738,
          lon2: 8.475399613380434
        },
        title: 'J, Luzenberg, Waldhof, Mannheim, Baden-Württemberg, 68305, Germany',
        type: 'free'
      }
    ];
    DocumentPage.CreateForeignProjectDocumentWithAPI(docTitle, spacial);
    cy.pageReload('mat-tree mat-tree-node', docTitle);

    Tree.openNode([docTitle]);
    DocumentPage.choosePublishOption(PublishOptions.ConfirmPublish, true);
    BasePage.checkErrorDialogMessage('Es trat ein Fehler bei der JSON-Schema Validierung auf');
  });
  it('should add a maximum one spatial reference (#3747) using UI', () => {
    const docTitle = 'A_mit_2_Raumbezug_UI' + Utils.randomString();
    DocumentPage.CreateForeignProjectDocumentWithAPI(docTitle, null);

    cy.pageReload('ige-document-list-item');

    Tree.openNode([docTitle]);
    enterMcloudDocTestData.setSpatialBbox('add spatial reference uvp', 'Berlin', false);
    cy.get('[data-cy="spatialButton"]').should('not.exist');
  });

  it('should not download file before corresponding document has been published (#3831)', () => {
    const fileName = 'research(5).csv';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_10']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // try to access file attached to unpublished document
      uvpPage.tryToAccessFile(id, fileName, 404);
      // publish document
      DocumentPage.publishNow();
      // make sure download is possible
      uvpPage.tryToAccessFile(id, fileName, 200);
    });
  });

  xit('should be possible to download file after upload has been removed and corresponding document saved (#3831) (1)', () => {
    const fileName = 'research(5).csv';

    Tree.openNode(['Plan_Ordner_4', 'Plan_A_10']);
    DocumentPage.openUpDocumentHeader();
    DocumentPage.getInfoInDocumentHeader(headerElements.ID).then(id => {
      // access file belonging to published document
      uvpPage.tryToAccessFile(id, fileName, 200);
      // add replacing file (disposable step if document is changed in database to have more files attached)
      // modify following method to specify which
      enterMcloudDocTestData.openDownloadDialog();
      enterMcloudDocTestData.uploadFile('Test.pdf');
      // delete file from document and save   -> method: delete file attached to document (s. auch upload.spec.ts)
      cy.get('[data-cy="Downloads-table"] mat-row [svgicon="Mehr"]').click();
      cy.contains('.mat-menu-panel button', 'Löschen').click();
      // check that download table has disappeared
      cy.get('[data-cy="Downloads-table"]').should('not.exist');
      DocumentPage.saveDocument();
      // make sure file can still be accessed
    });
  });
  xit('should not be possible to download file after upload has been removed and corresponding document published (#3831) (2)', () => {});
  xit('should not be possible to download file after publication of corresponding document has been revoked (#3831)', () => {});
  xit('should not be possible to download file of document with planned publishing until document is published (#3831)', () => {});
  xit('should make available for download the uploads belonging to the copy if document has been copied and published (#3831)', () => {});
  xit('should be possible to download file of document until expiry of valid-until-date (#3831)', () => {});
  xit('should not be possible to download file of document after expiry of valid-until-date (#3831)', () => {});
});
