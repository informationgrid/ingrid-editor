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

describe('uvp documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    DocumentPage.visit();
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

  it('should search for uvp documents according to uvp document type parameter', () => {
    Menu.switchTo('RESEARCH');
    uvpPage.setSearchParameter('Verfahrenstyp', 'Zulassungsverfahren');
    ResearchPage.waitForSearch();
    // make sure search returns only documents of the right type
    cy.get('tbody tr').each(el => {
      cy.wrap(el).find('mat-icon').invoke('attr', 'data-mat-icon-name').should('eq', 'zulassungsverfahren');
    });
  });
});
