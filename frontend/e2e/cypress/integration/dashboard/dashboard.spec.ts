import { DashboardPage, Shortcuts } from '../../pages/dashboard.page';
import { DocumentPage } from '../../pages/document.page';
import { Utils } from '../../pages/utils';
import { Address, AddressPage } from '../../pages/address.page';
import { Tree } from '../../pages/tree.partial';
import { Menu } from '../../pages/menu';

describe('Dashboard', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    cy.visit('');
  });

  it('should be shown as initial page when visiting app', () => {
    cy.get('.welcome').should('contain.text', 'Willkommen');
    cy.url().should('include', '/dashboard');
  });

  it('make sure number of published and draft documents in chart is present and adds up', function () {
    cy.get('.box.working .count').countShouldBeGreaterThan(0);
    cy.get('.box .count').countShouldBeGreaterThan(0);
    // check if sum of drafted and published documents equals the total number of displayed documents
    let sum = 0;
    cy.get('.count')
      .each($element => {
        sum += parseInt($element.text());
      })
      .then(_ => {
        DashboardPage.getCount(DashboardPage.totalDisplay).then(_ => {
          expect(sum).to.equal(_);
        });
      });
  });

  it('should check last updated document from latest docs box', () => {
    Menu.switchTo('DOCUMENTS');
    let docName = 'TestDocResearch1';
    Tree.openNode([docName]);
    DocumentPage.addDescription('description');
    DocumentPage.saveDocument();
    DashboardPage.visit();
    Menu.switchTo('DASHBOARD');
    DashboardPage.getLatestDocTitle(1).then(text => {
      expect(text).contains(docName);
    });
    DashboardPage.getLatestDocEditTime(1).then(text => {
      expect(text).contains('Gerade eben');
    });
  });

  it('should update display after creating new documents', () => {
    const docTitle = 'documentName' + Utils.randomString();
    const addressFirstName = 'firstName' + Utils.randomString();
    const addressLastName = 'firstName' + Utils.randomString();
    const addressData = {
      firstName: addressFirstName,
      lastName: addressLastName,
      organization: 'org',
      title: 'APICreatedAddress' + Utils.randomString(),
      _type: 'McloudAddressDoc',
      contact: [{ type: 1, connection: '0123456789' }]
    };
    // check state of display before creation of new documents
    DashboardPage.getCount(DashboardPage.draftedDocuments).then(numberBefore => {
      // create doc via api
      DocumentPage.CreateFullMcloudDocumentWithAPI(docTitle, false);
      // create address via api
      AddressPage.apiCreateAddress(addressData, false);
      // check last-edited-display in data section
      Menu.switchTo('DOCUMENTS');
      cy.get('.mat-card-content').should('contain', docTitle);
      // check last-edited-display in address section
      Menu.switchTo('ADDRESSES');
      cy.get('.mat-card-content').should('contain', addressData.title);
      // check dashboard display and see if number has increased
      Menu.switchTo('DASHBOARD');
      DashboardPage.getCount(DashboardPage.draftedDocuments).then(numberAfter => {
        cy.contains('.mat-card-content mat-selection-list', docTitle);
        expect(numberAfter).to.be.greaterThan(numberBefore);
        // check that the display has been increased by one (= one new data document)
        expect(numberAfter - 1).to.equal(numberBefore);
      });
    });
  });

  it('should load a document from dashboard from latest docs box', () => {
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.url().should('include', '/form;id=');
      cy.get(DocumentPage.title).should('have.text', text);
    });
  });

  describe('Search', () => {
    it('should open a document from a quick search result', () => {
      DashboardPage.search('TestDocResearch3');
      DashboardPage.getSearchResult(1).click();
      cy.get(DocumentPage.title).should('have.text', 'TestDocResearch3');
    });

    it('should show empty search input field when clicking on x-button', function () {
      const searchTerm = 'whatever';
      DashboardPage.search(searchTerm);
      cy.get('ige-quick-search input').should('have.value', searchTerm);
      DashboardPage.clearSearch();
      cy.get('ige-quick-search').get('input').should('have.value', '');
    });
  });

  describe('Action Buttons', () => {
    it('should create a new folder', () => {
      const folderName = 'Test Ordner aus dashboard button' + Utils.randomString();
      DashboardPage.startShortcutAction(Shortcuts.NewFolder);
      DocumentPage.fillCreateDialog(folderName);
      cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', folderName);
    });

    it('should create a new document', () => {
      const dataName = 'Test Datensatz aus dashboard button' + Utils.randomString();
      DashboardPage.startShortcutAction(Shortcuts.NewDataset);
      DocumentPage.fillCreateDialog(dataName);
      cy.get(DocumentPage.title, { timeout: 10000 }).should('have.text', dataName);
    });

    it('should create a new address', () => {
      const instituteName = 'Test Adresse aus dashboard button ' + Utils.randomString();
      DashboardPage.startShortcutAction(Shortcuts.NewAddress);
      AddressPage.CreateDialog.fillOrganizationType(new Address(instituteName, '', ''));
      DocumentPage.CreateDialog.execute();
      cy.get(AddressPage.title, { timeout: 10000 }).should('have.text', instituteName);
    });
  });
});
