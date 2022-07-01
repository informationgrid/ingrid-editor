import { DocumentPage, headerElements, PublishOptions } from '../../../pages/document.page';
import { Utils } from '../../../pages/utils';
import { Tree } from '../../../pages/tree.partial';
import { Menu } from '../../../pages/menu';
import { AddressDetails, UVPmetrics, uvpPage, UVPreports } from '../../../pages/uvp.page';
import { enterMcloudDocTestData } from '../../../pages/enterMcloudDocTestData';
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

    // check content of fields
    DocumentPage.checkValueOfField('[data-cy="Allgemeine Vorhabenbeschreibung"]', 'textarea', 'some description');
    DocumentPage.checkContentOfField(
      '[data-cy="Kontaktdaten der verfahrensführenden Behörde"]',
      'ige-address-card',
      'Ansprechpartner Adresse, Organisation_6'
    );
    DocumentPage.checkValueOfField('[data-cy="Eingang des Antrags"]', 'input', '02.12.2021');
    DocumentPage.checkContentOfField('[data-cy="UVP-Nummern"]', '.list-item', 'UVPG-1.1.1');
    DocumentPage.checkContentOfField('.spatial-title', '', 'Fulda');
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
    DocumentPage.checkValueOfField('[data-cy="Allgemeine Vorhabenbeschreibung"]', 'textarea', 'some description');
    DocumentPage.checkContentOfField(
      '[data-cy="Kontaktdaten der verfahrensführenden Behörde"]',
      'ige-address-card',
      'Ansprechpartner Adresse, Organisation_7'
    );
    DocumentPage.checkValueOfField('[data-cy="Eingang des Antrags"]', 'input', '03.12.2021');
    DocumentPage.checkContentOfField('[data-cy="UVP-Nummern"]', '.list-item', 'UVPG-1.1.1');
    DocumentPage.checkContentOfField('.spatial-title', '', 'Fulda');
    cy.get('[data-cy="Vorprüfung durchgeführt"] mat-radio-button').should('have.class', 'mat-radio-checked');
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
    DocumentPage.checkValueOfField('[data-cy="Allgemeine Vorhabenbeschreibung"]', 'textarea', 'some other description');
    DocumentPage.checkContentOfField(
      '[data-cy="Kontaktdaten der verfahrensführenden Behörde"]',
      'ige-address-card',
      'Ansprechpartner Adresse, Organisation_8'
    );
    DocumentPage.checkValueOfField('[data-cy="Eingang des Antrags"]', 'input', '04.12.2021');
    DocumentPage.checkContentOfField('[data-cy="UVP-Nummern"]', '.list-item', 'UVPG-1.1.1');
    DocumentPage.checkContentOfField('.spatial-title', '', 'Bonn');
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
    DocumentPage.checkValueOfField('[data-cy="Allgemeine Vorhabenbeschreibung"]', 'textarea', 'some more description');
    DocumentPage.checkContentOfField(
      '[data-cy="Kontaktdaten der verfahrensführenden Behörde"]',
      'ige-address-card',
      'Ansprechpartner Adresse, Organisation_9'
    );
    DocumentPage.checkContentOfField('.spatial-title', '', 'Olpe');
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
    DocumentPage.checkContentOfField(
      '[data-cy="Kontaktdaten der verfahrensführenden Behörde"]',
      'ige-address-card',
      'Ansprechpartner Adresse, Organisation_10'
    );
    DocumentPage.checkValueOfField('[data-cy="Datum der Entscheidung"]', 'input', '06.12.2021');
  });

  it('should add procedure steps to document of type "Linienbestimmung"', () => {
    Tree.openNode(['Plan_L']);

    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="start"]', '12.12.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.12.2021');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'Berichte und Empfehlungen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('Test.pdf', true);
    DocumentPage.addTableEntry(0, 'Weitere Unterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="start"]', '12.02.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="end"]', '24.02.2021');
    DocumentPage.addTableEntry(1, 'Informationen zum Erörterungstermin', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_1.json', true);

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.addTableEntry(2, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_5.json', true);
    DocumentPage.addTableEntry(2, 'Entscheidung', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_4.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Auslegung"]',
      'input[formcontrolname="start"]',
      '12.12.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.12.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'Test.pdf');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Erörterungstermin'
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Erörterung"]',
      'input[formcontrolname="start"]',
      '12.02.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="end"]', '24.02.2021');
    DocumentPage.checkTableEntry(1, 'Informationen zum Erörterungstermin', 'importtest_1.json');

    // check 'Entscheidung über die Zulassung'
    DocumentPage.checkValueOfField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.checkTableEntry(2, 'Auslegungsinformationen', 'importtest_5.json');
    DocumentPage.checkTableEntry(2, 'Entscheidung', 'importtest_4.json');
  });

  it('should add procedure steps to document of type "Zulassungsverfahren"', () => {
    Tree.openNode(['Plan_Z']);

    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="start"]', '01.01.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.01.2021');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'Berichte und Empfehlungen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('Test.pdf', true);
    DocumentPage.addTableEntry(0, 'Weitere Unterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="start"]', '12.02.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="end"]', '24.02.2021');
    DocumentPage.addTableEntry(1, 'Informationen zum Erörterungstermin', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_1.json', true);

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.addTableEntry(2, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_4.json', true);
    DocumentPage.addTableEntry(2, 'Entscheidung', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_5.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Auslegung"]',
      'input[formcontrolname="start"]',
      '01.01.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.01.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'Test.pdf');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Erörterungstermin'
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Erörterung"]',
      'input[formcontrolname="start"]',
      '12.02.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="end"]', '24.02.2021');
    DocumentPage.checkTableEntry(1, 'Informationen zum Erörterungstermin', 'importtest_1.json');

    // check 'Entscheidung über die Zulassung'
    DocumentPage.checkValueOfField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.checkTableEntry(2, 'Auslegungsinformationen', 'importtest_4.json');
    DocumentPage.checkTableEntry(2, 'Entscheidung', 'importtest_5.json');
  });

  it('should add procedure steps to document of type "Raumordnungsverfahren"', () => {
    Tree.openNode(['Plan_R']);

    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="start"]', '10.01.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.01.2021');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'Berichte und Empfehlungen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('Test.pdf', true);
    DocumentPage.addTableEntry(0, 'Weitere Unterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Erörterungstermin');
    DocumentPage.fillInField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="start"]', '12.02.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="end"]', '24.02.2021');
    DocumentPage.addTableEntry(1, 'Informationen zum Erörterungstermin', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_1.json', true);

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.addTableEntry(2, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_4.json', true);
    DocumentPage.addTableEntry(2, 'Entscheidung', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_5.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Auslegung"]',
      'input[formcontrolname="start"]',
      '10.01.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.01.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'Test.pdf');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Erörterungstermin'
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Erörterung"]',
      'input[formcontrolname="start"]',
      '12.02.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Erörterung"]', 'input[formcontrolname="end"]', '24.02.2021');
    DocumentPage.checkTableEntry(1, 'Informationen zum Erörterungstermin', 'importtest_1.json');

    // check 'Entscheidung über die Zulassung'
    DocumentPage.checkValueOfField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.checkTableEntry(2, 'Auslegungsinformationen', 'importtest_4.json');
    DocumentPage.checkTableEntry(2, 'Entscheidung', 'importtest_5.json');
  });

  it('should add procedure steps to document of type "Ausländisches Vorhaben"', () => {
    Tree.openNode(['Plan_A']);

    uvpPage.addProcedureSteps('Öffentliche Auslegung');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="start"]', '10.01.2021');
    DocumentPage.fillInField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.01.2021');
    DocumentPage.addTableEntry(0, 'Auslegungsinformationen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some url', 'https://cypress.io');
    BasePage.closeDialogAndAdoptChoices();
    DocumentPage.addTableEntry(0, 'Berichte und Empfehlungen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_2.json', true);
    DocumentPage.addTableEntry(0, 'Weitere Unterlagen', 'Link angeben');
    enterMcloudDocTestData.fillFieldsOfAddURLDialog('some other url', 'https://cypress.io/dashboard');
    BasePage.closeDialogAndAdoptChoices();

    uvpPage.addProcedureSteps('Entscheidung über die Zulassung');
    DocumentPage.fillInField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.addTableEntry(1, 'Auslegungsinformationen', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_4.json', true);
    DocumentPage.addTableEntry(1, 'Entscheidung', 'Dateien hochladen');
    enterMcloudDocTestData.uploadFile('importtest_5.json', true);

    DocumentPage.saveDocument();

    // check content of fields after saving
    DocumentPage.checkValueOfField(
      '[data-cy="Zeitraum der Auslegung"]',
      'input[formcontrolname="start"]',
      '10.01.2021'
    );
    DocumentPage.checkValueOfField('[data-cy="Zeitraum der Auslegung"]', 'input[formcontrolname="end"]', '24.01.2021');
    DocumentPage.checkTableEntry(0, 'Auslegungsinformationen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'UVP Bericht/Antragsunterlagen', 'https://cypress.io');
    DocumentPage.checkTableEntry(0, 'Berichte und Empfehlungen', 'importtest_2.json');
    DocumentPage.checkTableEntry(0, 'Weitere Unterlagen', 'https://cypress.io/dashboard');

    // check 'Entscheidung über die Zulassung'
    DocumentPage.checkValueOfField('[data-cy="Datum der Entscheidung"]', 'input', '20.05.2022');
    DocumentPage.checkTableEntry(1, 'Auslegungsinformationen', 'importtest_4.json');
    DocumentPage.checkTableEntry(1, 'Entscheidung', 'importtest_5.json');
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
