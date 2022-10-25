import { DocumentPage, PublishOptions } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Tree } from '../../../pages/tree.partial';
import { Menu } from '../../../pages/menu';
import { uvpPage } from '../../../pages/uvp.page';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
import { ResearchPage } from '../../../pages/research.page';
import { BasePage } from '../../../pages/base.page';
import { fileDataTransferManagement } from '../../../pages/fileDataTransferManagement.page';

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

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_6'
    );
    cy.get('[data-cy="receiptDate"] input').should('have.value', '02.12.2021');
    cy.get('[data-cy="eiaNumbers"] .list-item').should('contain.text', 'UVPG-1.1.1');
    cy.get('.spatial-title').should('contain.text', 'Fulda');
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

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_7'
    );
    cy.get('[data-cy="receiptDate"] input').should('have.value', '03.12.2021');
    cy.get('[data-cy="eiaNumbers"] .list-item').should('contain.text', 'UVPG-1.1.1');
    cy.get('.spatial-title').should('contain.text', 'Fulda');
    cy.get('[data-cy="prelimAssessment"] mat-radio-button').should('have.class', 'mat-radio-checked');
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

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some other description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_8'
    );
    cy.get('[data-cy="receiptDate"] input').should('have.value', '04.12.2021');
    cy.get('[data-cy="eiaNumbers"] .list-item').should('contain.text', 'UVPG-1.1.1');
    cy.get('.spatial-title').should('contain.text', 'Bonn');
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

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some more description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_9'
    );
    cy.get('.spatial-title').should('contain.text', 'Olpe');
  });

  it('create a minimal publishable document of type "Negative Vorprüfung" and publish it', () => {
    Tree.openNode(['Plan_N']);

    // add address
    uvpPage.setAddress('Adresse, Organisation_10');
    // add arrival date of request
    uvpPage.setDecisionDate('06.12.2021');
    // publish
    DocumentPage.publishNow();

    // check content of fields
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_10'
    );
    cy.get('[data-cy="decisionDate"] input').should('have.value', '06.12.2021');
  });

  it('Create a completely filled dataset of type "Linienbestimmung" that can be published', () => {
    Tree.openNode(['Plan_L_1']);

    // add description
    uvpPage.setDescription('some expressive description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_10');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Sayda', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('02.07.2021');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.1');

    // add additional steps
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="start"]', '12.12.2021');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="end"]', '24.12.2021');

    fileDataTransferManagement.openAddURLDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();

    fileDataTransferManagement.openAddURLDialog('UVP Bericht/Antragsunterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();

    fileDataTransferManagement.openUploadDialog('Berichte und Empfehlungen', 0);
    fileDataTransferManagement.uploadFile('Test.pdf', true);

    fileDataTransferManagement.openAddURLDialog('Weitere Unterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="start"]', '12.02.2021');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="end"]', '24.02.2021');

    fileDataTransferManagement.openUploadDialog('Informationen zum Erörterungstermin', 1);
    fileDataTransferManagement.uploadFile('importtest_1.json', true);

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="decisionDate"]', 'input', '20.05.2022');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 2);
    fileDataTransferManagement.uploadFile('importtest_5.json', true);

    fileDataTransferManagement.openUploadDialog('Entscheidung', 2);
    fileDataTransferManagement.uploadFile('importtest_4.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    cy.get('[data-cy="description"] textarea').should('have.value', 'some expressive description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_10'
    );
    cy.get('[data-cy="receiptDate"] input').should('have.value', '02.07.2021');
    cy.get('[data-cy="eiaNumbers"] .list-item').should('contain.text', 'UVPG-1.1.1');
    cy.get('.spatial-title').should('contain.text', 'Sayda');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="start"]').should('have.value', '12.12.2021');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="end"]').should('have.value', '24.12.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'Test.pdf');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Erörterungstermin'
    cy.get('[data-cy="publicHearingDate"] input[formcontrolname="start"]').should('have.value', '12.02.2021');
    cy.get('[data-cy="publicHearingDate"] input[formcontrolname="end"]').should('have.value', '24.02.2021');
    DocumentPage.checkTableEntry(1, 'Informationen zum Erörterungstermin', 'importtest_1.json');

    // check 'Entscheidung über die Zulassung'
    cy.get('[data-cy="decisionDate"] input').should('have.value', '20.05.2022');
    DocumentPage.checkTableEntry(2, 'Auslegungsinformationen', 'importtest_5.json');
    DocumentPage.checkTableEntry(2, 'Entscheidung', 'importtest_4.json');

    DocumentPage.publishNow();
  });

  it('Create a completely filled dataset of type "Zulassungsverfahren" that can be published', () => {
    Tree.openNode(['Plan_Z_1']);

    // add description
    uvpPage.setDescription('some description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_7');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Annaburg', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('03.10.2020');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.2');
    // was there a preliminary assessment?
    uvpPage.IsPreliminaryAssessment('Ja');

    // add steps
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="start"]', '01.01.2021');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="end"]', '24.01.2021');

    fileDataTransferManagement.openAddURLDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();

    fileDataTransferManagement.openAddURLDialog('UVP Bericht/Antragsunterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();

    fileDataTransferManagement.openUploadDialog('Berichte und Empfehlungen', 0);
    fileDataTransferManagement.uploadFile('Test.pdf', true);

    fileDataTransferManagement.openAddURLDialog('Weitere Unterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="start"]', '12.02.2021');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="end"]', '24.02.2021');

    fileDataTransferManagement.openUploadDialog('Informationen zum Erörterungstermin', 1);
    fileDataTransferManagement.uploadFile('importtest_1.json', true);

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="decisionDate"]', 'input', '20.05.2022');

    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 2);
    fileDataTransferManagement.uploadFile('importtest_4.json', true);

    fileDataTransferManagement.openUploadDialog('Entscheidung', 2);
    fileDataTransferManagement.uploadFile('importtest_5.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    cy.get('[data-cy="description"] textarea').should('have.value', 'some description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_7'
    );
    cy.get('[data-cy="receiptDate"] input').should('have.value', '03.10.2020');
    cy.get('[data-cy="eiaNumbers"] .list-item').should('contain.text', 'UVPG-1.1.2');
    cy.get('.spatial-title').should('contain.text', 'Annaburg');
    cy.get('[data-cy="prelimAssessment"] mat-radio-button').should('have.class', 'mat-radio-checked');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="start"]').should('have.value', '01.01.2021');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="end"]').should('have.value', '24.01.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'Test.pdf');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Erörterungstermin'
    cy.get('[data-cy="publicHearingDate"] input[formcontrolname="start"]').should('have.value', '12.02.2021');
    cy.get('[data-cy="publicHearingDate"] input[formcontrolname="end"]').should('have.value', '24.02.2021');
    DocumentPage.checkTableEntry(1, 'Informationen zum Erörterungstermin', 'importtest_1.json');

    // check 'Entscheidung über die Zulassung'
    cy.get('[data-cy="decisionDate"] input').should('have.value', '20.05.2022');
    DocumentPage.checkTableEntry(2, 'Auslegungsinformationen', 'importtest_4.json');
    DocumentPage.checkTableEntry(2, 'Entscheidung', 'importtest_5.json');

    DocumentPage.publishNow();
  });

  it('Create a completely filled dataset of type "Raumordnungsverfahren" that can be published', () => {
    Tree.openNode(['Plan_R_1']);

    // add description
    uvpPage.setDescription('some description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_8');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Niesky', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('05.12.2020');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.2');

    // add steps
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="start"]', '10.01.2021');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="end"]', '24.01.2021');
    fileDataTransferManagement.openAddURLDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    fileDataTransferManagement.openAddURLDialog('UVP Bericht/Antragsunterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    fileDataTransferManagement.openUploadDialog('Berichte und Empfehlungen', 0);
    fileDataTransferManagement.uploadFile('Test.pdf', true);
    fileDataTransferManagement.openAddURLDialog('Weitere Unterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="start"]', '12.02.2021');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="end"]', '24.02.2021');
    fileDataTransferManagement.openUploadDialog('Informationen zum Erörterungstermin', 1);
    fileDataTransferManagement.uploadFile('importtest_1.json', true);

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="decisionDate"]', 'input', '20.05.2022');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 2);
    fileDataTransferManagement.uploadFile('importtest_4.json', true);
    fileDataTransferManagement.openUploadDialog('Entscheidung', 2);
    fileDataTransferManagement.uploadFile('importtest_5.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    cy.get('[data-cy="description"] textarea').should('have.value', 'some description');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_8'
    );
    cy.get('[data-cy="receiptDate"] input').should('have.value', '05.12.2020');
    cy.get('[data-cy="eiaNumbers"] .list-item').should('contain.text', 'UVPG-1.1.2');
    cy.get('.spatial-title').should('contain.text', 'Niesky');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="start"]').should('have.value', '10.01.2021');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="end"]').should('have.value', '24.01.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'Test.pdf');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Erörterungstermin'
    cy.get('[data-cy="publicHearingDate"] input[formcontrolname="start"]').should('have.value', '12.02.2021');
    cy.get('[data-cy="publicHearingDate"] input[formcontrolname="end"]').should('have.value', '24.02.2021');
    DocumentPage.checkTableEntry(1, 'Informationen zum Erörterungstermin', 'importtest_1.json');

    // check 'Entscheidung über die Zulassung'
    cy.get('[data-cy="decisionDate"] input').should('have.value', '20.05.2022');
    DocumentPage.checkTableEntry(2, 'Auslegungsinformationen', 'importtest_4.json');
    DocumentPage.checkTableEntry(2, 'Entscheidung', 'importtest_5.json');

    DocumentPage.publishNow();
  });

  it('Create a completely filled dataset of type "Ausländisches Vorhaben" that can be published', () => {
    Tree.openNode(['Plan_A_1']);

    // add description
    uvpPage.setDescription('descr');
    // add address
    uvpPage.setAddress('Adresse, Organisation_9');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Barby', false);

    // add steps
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="start"]', '10.01.2021');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="end"]', '24.01.2021');
    fileDataTransferManagement.openAddURLDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    fileDataTransferManagement.openAddURLDialog('UVP Bericht/Antragsunterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    fileDataTransferManagement.openUploadDialog('Berichte und Empfehlungen', 0);
    fileDataTransferManagement.uploadFile('importtest_2.json', true);
    fileDataTransferManagement.openAddURLDialog('Weitere Unterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="decisionDate"]', 'input', '20.05.2022');
    fileDataTransferManagement.openUploadDialog('Auslegungsinformationen', 1);
    fileDataTransferManagement.uploadFile('importtest_4.json', true);
    fileDataTransferManagement.openUploadDialog('Entscheidung', 1);
    fileDataTransferManagement.uploadFile('importtest_5.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    cy.get('[data-cy="description"] textarea').should('have.value', 'descr');
    cy.get('[data-cy="pointOfContact"] ige-address-card').should(
      'contain.text',
      'Ansprechpartner Adresse, Organisation_9'
    );
    cy.get('.spatial-title').should('contain.text', 'Barby');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="start"]').should('have.value', '10.01.2021');
    cy.get('[data-cy="disclosureDate"] input[formcontrolname="end"]').should('have.value', '24.01.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'importtest_2.json');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Entscheidung über die Zulassung'
    cy.get('[data-cy="decisionDate"] input').should('have.value', '20.05.2022');
    DocumentPage.checkTableEntry(1, 'Auslegungsinformationen', 'importtest_4.json');
    DocumentPage.checkTableEntry(1, 'Entscheidung', 'importtest_5.json');

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

  it('should not publish document if date of "Datum des Antrags" is later than begin of "Erste Auslegung"', () => {
    Tree.openNode(['Plan_Ordner_3', 'Plan_L_2']);

    // add description
    uvpPage.setDescription('description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_10');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Euba', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('02.07.2021');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.1.1');

    // add step "öffentliche Auslegung"
    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="start"]', '12.12.2020');
    DocumentPage.fillInField('[data-cy="disclosureDate"]', 'input[formcontrolname="end"]', '24.12.2020');
    fileDataTransferManagement.openAddURLDialog('Auslegungsinformationen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io/quatsch');
    BasePage.closeDialogAndAdoptChoices();
    fileDataTransferManagement.openAddURLDialog('UVP Bericht/Antragsunterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    fileDataTransferManagement.openUploadDialog('Berichte und Empfehlungen', 0);
    fileDataTransferManagement.uploadFile('Test.pdf', true);
    fileDataTransferManagement.openAddURLDialog('Weitere Unterlagen', 0);
    fileDataTransferManagement.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    // try to publish and expect error
    cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
    cy.get(DocumentPage.Toolbar.PublishNow).click();
    cy.hasErrorDialog('Es müssen alle Felder korrekt');
    cy.containsFormErrors(1);
    cy.contains('.mat-error formly-validation-message', /Datum muss vor dem Beginn der ersten Auslegung sein/);
  });

  it('should check for the content of preview dialog for UVP catalog data record, #4269', function () {
    DocumentPage.visit();
    // open published document and check for the content
    Tree.openNode(['Plan_to_preview']);
    cy.get(DocumentPage.Toolbar.Preview).click();

    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=description] ige-print-type ', 'desc Allgemeine');
    DocumentPage.checkOfExistingItem(
      'mat-dialog-content [data-cy=pointOfContact] ige-print-type ',
      'Adresse, Organisation_1'
    );
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=receiptDate] input ', '04.10.2022', 0, true);
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=eiaNumbers] ', ' UVPG-1.1.1 ');

    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy=Auslegungsinformationen-table]  ', 'testlink');
    DocumentPage.checkOfExistingItem(
      'mat-dialog-content [data-cy="UVP Bericht/Antragsunterlagen-table"]  ',
      'UVPBericht'
    );
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy="Berichte und Empfehlungen-table"]  ', 'Emp_desk');
    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy="Weitere Unterlagen-table"]  ', 'other');

    DocumentPage.checkOfExistingItem(
      'mat-dialog-content [data-cy="Informationen zum Erörterungstermin-table"]  ',
      'info about app'
    );

    DocumentPage.checkOfExistingItem('mat-dialog-content [data-cy="Entscheidung-table"]  ', 'Entscheidung ueber alles');
  });
  // validation not yet implemented (09/01/22)
  xit('should not publish document if date of "Datum des Antrags" is later than begin of "Erörterungszeitraum" #4057', () => {
    Tree.openNode(['Plan_Ordner_3', 'Plan_L_2']);

    // add description
    uvpPage.setDescription('description');
    // add address
    uvpPage.setAddress('Adresse, Organisation_6');
    // add spatial reference
    enterMcloudDocTestData.setSpatialBbox('information about location', 'Nidda', false);
    // add arrival date of request
    uvpPage.setDateOfRequest('12.07.2021');
    // add uvp number
    uvpPage.setUVPnumber('UVPG-1.2.1');

    // add step "Erörterungstermin"
    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="start"]', '12.02.2020');
    DocumentPage.fillInField('[data-cy="publicHearingDate"]', 'input[formcontrolname="end"]', '24.02.2020');
    // DocumentPage.addTableEntry(0, 'Informationen zum Erörterungstermin', 'Dateien hochladen');
    fileDataTransferManagement.openUploadDialog('Informationen zum Erörterungstermin', 0);
    fileDataTransferManagement.uploadFile('importtest_1.json', true);

    // try to publish and expect error
    cy.get(DocumentPage.Toolbar.Publish).should('be.enabled');
    cy.get(DocumentPage.Toolbar.PublishNow).click();
    cy.hasErrorDialog('Es müssen alle Felder korrekt');
    cy.containsFormErrors(1);
    cy.contains('.mat-error formly-validation-message', /Datum muss vor dem Beginn des Erörterungstermins sein/);
  });
});
