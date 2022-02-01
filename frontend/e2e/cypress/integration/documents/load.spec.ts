import { DocumentPage, ROOT, SEPARATOR } from '../../pages/document.page';
import { beforeEach } from 'mocha';
import { Tree } from '../../pages/tree.partial';
import { AddressPage } from '../../pages/address.page';
import { enterMcloudDocTestData } from '../../pages/enterMcloudDocTestData';

describe('Load documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
  });

  // tested in dashboard
  // it('should load a document from dashboard', () => {

  it('should show a dashboard view when no document is selected or in root element', function () {
    DocumentPage.visit();
    cy.get('ige-form-dashboard', { timeout: 20000 }).should('exist');

    cy.get('ige-form-dashboard').should('contain', 'Daten').should('contain', 'Neuer Datensatz');
    // expect(cy.get('ige-form-dashboard')).to.contain('text');
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get('ige-form-info ige-breadcrumb .selectable').click();
    cy.get('ige-form-dashboard').should('contain', 'Daten').should('contain', 'Neuer Datensatz');
  });

  it('should jump directly to a root folder specified by URL', () => {
    cy.visit('/form;id=a0df9837-512a-4594-b2ef-2814f7c55c81');
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'Neue Testdokumente');
    cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
  });

  it('should jump directly to a nested folder specified by URL', () => {
    cy.visit('/form;id=9b264daf-3044-441d-864c-699b44c46dc1');
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'Tiefes Dokument');
    // this function waits for text to appear, but shouldHaveTrimmedText not!
    cy.get('ige-form-info ige-breadcrumb').should(
      'have.text',
      `${ROOT}${SEPARATOR}Testdokumente${SEPARATOR}Ordner 2. Ebene`
    );
  });

  // tested in dashboard
  // it('should open a document from a quick search result', () => {

  it('should open a document from a tree search result on form page', () => {
    DocumentPage.visit();
    DocumentPage.search('TestDocResearch1');
    DocumentPage.getSearchResult().click();
    cy.get(DocumentPage.title).should('have.text', 'TestDocResearch1');
  });

  it('should open the previously selected document when going to another page and returning', function () {
    DocumentPage.visitSingleDoc();
    cy.get(DocumentPage.title).should('have.text', 'TestDocResearch2');
    cy.get(DocumentPage.Sidemenu.Uebersicht).click();
    cy.get(DocumentPage.Sidemenu.Adressen).click();
    cy.get(DocumentPage.Sidemenu.Daten).click();
    cy.get(DocumentPage.title).should('have.text', 'TestDocResearch2');
  });

  it('should only show last used addresses of same catalog when adding address to document (#3335)', () => {
    // add address to document
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    enterMcloudDocTestData.CreateDialog.setAddress('Limousin, Adresse');
    DocumentPage.saveDocument();
    // visit new catalog and make sure recently added address is not among the suggestions
    cy.kcLogout();
    cy.kcLogin('ige3');
    DocumentPage.visit();
    // add an address to a document so that afterwards the 'last used addresses' field contains this address
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    AddressPage.addAddressToTestDocument(['Testadressen', 'Organisation_30, Nachname30, Name30'], 'Ansprechpartner');
    AddressPage.saveDocument();
    // open document, open add-address-dialog and check "last used addresses"-field
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_2']);
    cy.get('[data-cy="Adressen"] button').first().click();
    cy.get('[data-cy="recent-address-select"]').click();
    cy.get('[role="listbox"]').should(list => {
      expect(list).to.contain('Organisation_30, Nachname30, Name30');
      expect(list).to.not.contain('Limousin, Adresse');
    });
  });
});
