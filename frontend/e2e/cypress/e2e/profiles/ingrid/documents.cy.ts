import { DocumentPage } from '../../../pages/document.page';
import { Tree } from '../../../pages/tree.partial';
import { ingridDocumentPage } from '../../../pages/ingridDocuments.page';
import { fileDataTransferManagement } from '../../../pages/fileDataTransferManagement.page';
import { UvpDocumentPage } from '../../../pages/uvpDocument.page';

describe('ingrid documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('ingridcatalog').as('tokens');
    DocumentPage.visit();
  });

  it('create a minimal publishable document of type "Datensammlung" and publish it (#4643)', () => {
    Tree.openNode(['datensammlung_1']);
    ingridDocumentPage.setDescription('[id="InGridDataCollectiondescription"]', 'some description');
    ingridDocumentPage.setSpatialBbox('information about location', 'Auma', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_42/83 / GK_3',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '12.12.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Erstellung');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Deutsch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'Intranet');
    ingridDocumentPage.setChips('[data-cy="languages"]', 'Friesisch');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some description');
    cy.get('.spatial-title').should('contain.text', 'Auma');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_42/83 / GK_3');
    cy.get('[data-cy="events"] input').should('have.value', '12.12.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Erstellung');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Deutsch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'Intranet');
    cy.contains(`[data-cy="languages"] .mat-chip`, 'Friesisch');
  });

  it('create a minimal publishable document of type "Fachaufgabe" and publish it (#4643)', () => {
    Tree.openNode(['fachaufgabe_1']);
    ingridDocumentPage.setDescription('[id="InGridSpecialisedTaskdescription"]', 'some other description');
    ingridDocumentPage.setSpatialBbox('information about location', 'Maina', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_42/83 / GK_3',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '11.12.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Erstellung');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Deutsch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'Intranet');
    //ingridDocumentPage.setChips('[data-cy="languages"]', 'Friesisch');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[id="InGridSpecialisedTaskdescription"]').should('have.value', 'some other description');
    cy.get('.spatial-title').should('contain.text', 'Maina');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_42/83 / GK_3');
    cy.get('[data-cy="events"] input').should('have.value', '11.12.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Erstellung');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Deutsch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'Intranet');
    //cy.contains(`[data-cy="languages"] .mat-chip`, 'Friesisch');
  });

  it('create a minimal publishable document of type "Geodatendienst" and publish it (#4643)', () => {
    Tree.openNode(['geodatendienst_1']);
    ingridDocumentPage.setDescription('[id="InGridGeoServicedescription"]', 'some description');
    // Klassifikation des Dienstes
    ingridDocumentPage.chooseSelect(
      '[data-cy="serviceCategories"]',
      '.mat-select-trigger',
      'Codierungsdienst',
      '.list-item'
    );
    // add 'Art des Dienstes'
    cy.get('[data-cy="serviceCategories"]').parent().parent().next().find('ige-select-type').click({ force: true });
    cy.contains('.mat-option-text', 'Suchdienste').click();
    cy.contains('formly-field .mat-select-value-text', 'Suchdienste');

    ingridDocumentPage.setSpatialBbox('information about location', 'Weltwitz', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_DHDN / GK_3',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '18.12.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Erstellung');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Deutsch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'Intranet');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[id="InGridGeoServicedescription"]').should('have.value', 'some description');
    cy.get('.spatial-title').should('contain.text', 'Weltwitz');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_DHDN / GK_3');
    cy.contains(`[data-cy="serviceCategories"] .list-item`, 'Codierungsdienst');
    cy.contains('formly-field .mat-select-value-text', 'Suchdienste');
    cy.get('[data-cy="events"] input').should('have.value', '18.12.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Erstellung');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Deutsch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'Intranet');
  });

  it('create a minimal publishable document of type "Geodatensatz" and publish it (#4643)', () => {
    Tree.openNode(['geodatensatz_1']);

    ingridDocumentPage.chooseSelect('[data-cy="subType"]', '.mat-select-trigger', 'Datensatz');
    ingridDocumentPage.setDescription('[data-cy="description"].required textarea', 'some description');
    ingridDocumentPage.chooseSelect('[data-cy="topicCategories"]', '.mat-select-trigger', 'Biologie', '.list-item');
    ingridDocumentPage.setDescription('[data-cy="statement"] textarea', 'fachliche Grundlage');
    ingridDocumentPage.fillInField('[data-cy="identifier"]', 'input', 'Identifikator');
    ingridDocumentPage.setSpatialBbox('information about location', 'Triptis', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_42/83 / GK_3',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '12.12.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Erstellung');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Italienisch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'Intranet');
    ingridDocumentPage.setChips('[data-cy="languages"]', 'Friesisch');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some description');
    cy.contains(`[data-cy="subType"] .mat-select-trigger`, 'Datensatz');
    cy.contains(`[data-cy="topicCategories"] .list-item`, 'Biologie');
    cy.get('[data-cy="statement"] textarea').should('have.value', 'fachliche Grundlage');
    cy.get('[data-cy="identifier"] input').should('have.value', 'Identifikator');
    cy.get('.spatial-title').should('contain.text', 'Triptis');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_42/83 / GK_3');
    cy.get('[data-cy="events"] input').should('have.value', '12.12.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Erstellung');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Italienisch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'Intranet');
    cy.contains(`[data-cy="languages"] .mat-chip`, 'Friesisch');
  });

  it('create a minimal publishable document of type "Informationssystem" and publish it (#4643)', () => {
    Tree.openNode(['informationssystem_1']);

    ingridDocumentPage.setDescription('[data-cy="description"].required textarea', 'some more description');
    ingridDocumentPage.setSpatialBbox('information about location', 'Linda', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_42/83 / GK_3',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '13.12.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Publikation');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Dänisch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'amtsintern');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some more description');
    cy.get('.spatial-title').should('contain.text', 'Linda');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_42/83 / GK_3');
    cy.get('[data-cy="events"] input').should('have.value', '13.12.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Publikation');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Dänisch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'amtsintern');
  });

  it('create a minimal publishable document of type "Literatur" and publish it (#4643)', () => {
    Tree.openNode(['literatur_1']);

    ingridDocumentPage.setDescription('[data-cy="description"].required textarea', 'random description');
    ingridDocumentPage.setSpatialBbox('information about location', 'Heyda', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_ETRS89 / UTM',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '13.11.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Publikation');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Russisch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'amtsintern');
    ingridDocumentPage.setChips('[data-cy="languages"]', 'Lettisch');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'random description');
    cy.get('.spatial-title').should('contain.text', 'Heyda');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_ETRS89 / UTM');
    cy.get('[data-cy="events"] input').should('have.value', '13.11.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Publikation');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Russisch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'amtsintern');
    cy.contains(`[data-cy="languages"] .mat-chip`, 'Lettisch');
  });

  it('create a minimal publishable document of type "Projekt" and publish it (#4643)', () => {
    Tree.openNode(['projekt_1']);

    ingridDocumentPage.setDescription('[data-cy="description"].required textarea', 'some random description');
    ingridDocumentPage.setSpatialBbox('information about location', 'Kahla', false);
    ingridDocumentPage.chooseSelect(
      '[data-cy="spatialSystems"]',
      '.mat-select-trigger',
      'DE_DHDN / GK_3_BW100',
      '.list-item'
    );
    ingridDocumentPage.fillInField('[data-cy="events"]', 'input', '13.10.2020');
    ingridDocumentPage.chooseSelect('[data-cy="events"]', '.mat-select-trigger', 'Publikation');
    ingridDocumentPage.chooseSelect('[data-cy="Sprache / Zeichensatz"]', '.mat-select-trigger', 'Finnisch');
    ingridDocumentPage.chooseSelect('[data-cy="extraInfoPublishArea"]', '.mat-select-trigger', 'Intranet');

    DocumentPage.publishNow();

    // check content of fields
    cy.get('[data-cy="description"] textarea').should('have.value', 'some random description');
    cy.get('.spatial-title').should('contain.text', 'Kahla');
    cy.contains(`[data-cy="spatialSystems"] .list-item`, 'DE_DHDN / GK_3_BW100');
    cy.get('[data-cy="events"] input').should('have.value', '13.10.2020');
    cy.contains(`[data-cy="events"] .mat-select-trigger`, 'Publikation');
    cy.contains(`[data-cy="Sprache / Zeichensatz"] .mat-select-trigger`, 'Finnisch');
    cy.contains(`[data-cy="extraInfoPublishArea"] .mat-select-trigger`, 'Intranet');
  });
});

describe('ingrid documents with linked data sets', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('ingridcatalog').as('tokens');
    DocumentPage.visit();
  });

  it('Add multiple "Geodatensatz" as reference in "Geodatendienst" document and check for the "Geodatendienst" document in the added "Geodatensatz" documents', () => {
    Tree.openNode(['test_geodatensatz_ref', 'Geodatendienst_ref_datensatz']);

    ingridDocumentPage.selectDataRepresentationOption('Geodatensatz auswählen');
    ingridDocumentPage.searchAndSelectGeoDataSet('Geodatensatz_ref_1');
    ingridDocumentPage.selectDataRepresentationOption('Geodatensatz auswählen');
    ingridDocumentPage.searchAndSelectGeoDataSet('Geodatensatz_ref_2');

    DocumentPage.saveDocument();
    Tree.openNode(['test_geodatensatz_ref', 'Geodatensatz_ref_1']);
    ingridDocumentPage.checkForGeoDataServiceReference('Geodatendienst_ref_datensatz');
    Tree.openNode(['test_geodatensatz_ref', 'Geodatensatz_ref_2']);
    ingridDocumentPage.checkForGeoDataServiceReference('Geodatendienst_ref_datensatz');
  });
});
