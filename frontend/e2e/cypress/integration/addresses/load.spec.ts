import { DocumentPage, SEPARATOR } from '../../pages/document.page';
import { AddressPage, ROOT } from '../../pages/address.page';

describe('Load addresses', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    AddressPage.visit();
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should show a dashboard view when no address is selected or in root element', () => {
    cy.get('ige-address-dashboard').should('contain', 'Adressen').should('contain', 'Neue Adresse');
    // expect(cy.get('ige-address-dashboard')).to.contain('text');
    cy.visit('/address;id=4ff589e1-d83c-4856-8bae-2ae783f69da6');
    cy.get('ige-form-info ige-breadcrumb .selectable').click();
    cy.get('ige-address-dashboard').should('contain', 'Adressen').should('contain', 'Neue Adresse');
  });

  it('should jump directly to a root address folder specified by URL', () => {
    cy.visit('/address;id=4ff589e1-d83c-4856-8bae-2ae783f69da6');
    cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', 'Neue Testadressen');
    cy.get('ige-form-info ige-breadcrumb').shouldHaveTrimmedText(ROOT);
  });

  it('should jump directly to a nested address folder specified by URL', () => {
    cy.visit('/address;id=93ac91fc-4112-4975-86cb-48295a4d3915');
    cy.get(AddressPage.title, { timeout: 10000 }).should('have.text', 'Tiefe Adresse');
    // this function waits for text to appear, but shouldHaveTrimmedText not!
    cy.get('ige-form-info ige-breadcrumb').should(
      'have.text',
      `${ROOT}${SEPARATOR}Neue Testadressen${SEPARATOR}Ordner 2. Ebene`
    );
  });

  // tested in dashboard
  // xit('should open a document from a quick search result', () => {

  it('should open an address from a tree search result on form page', () => {
    DocumentPage.search('Testorganisation');
    DocumentPage.getSearchResult().contains('Testorganisation').click();
    cy.get(DocumentPage.title).should('have.text', 'Testorganisation');
  });

  it('should open the previously selected address when going to another page and returning', () => {
    const addressTitle = 'Testorganisation';
    cy.get('#sidebar').findByText('Testadressen').click();
    cy.get('#sidebar').findByText(addressTitle).click();
    cy.get(AddressPage.title).should('have.text', addressTitle);
    cy.get(AddressPage.Sidemenu.Uebersicht).click();
    cy.get(AddressPage.Sidemenu.Daten).click();
    cy.get(AddressPage.Sidemenu.Adressen).click();
    cy.get(AddressPage.title).should('have.text', addressTitle);
  });
});
