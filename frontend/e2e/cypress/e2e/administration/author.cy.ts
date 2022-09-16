import { DocumentPage } from '../../pages/document.page';
import { AddressPage } from '../../pages/address.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { Tree } from '../../pages/tree.partial';
import { ResearchPage, SearchOptionTabs } from '../../pages/research.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';

// user without authorizations (author)
describe('User without authorizations', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('mcloud-author-without-group');
  });

  it('Erweiterte Suche should show no search result to user without authorization, neither before nor after typing in search term', () => {
    // Make sure search page shows no data when visiting
    ResearchPage.visit();
    ResearchPage.checkNoSearchResults();
    // Make sure triggering search doesn't deliver search results
    ResearchPage.search('test');
    ResearchPage.checkNoSearchResults();
  });

  it('Should be shown blank dashboard', () => {
    DashboardPage.visit();
    cy.contains('In Bearbeitung').parent().contains('0');
    cy.contains('Veröffentlicht').parent().contains('0');
    cy.get('text.text').contains('0');
  });

  it('Author should see neither documents nor addresses', () => {
    // check if there is an empty tree for both adressen and daten
    DocumentPage.visit();
    cy.get('ige-empty-navigation').should('exist');
    AddressPage.visit();
    cy.get('ige-empty-navigation').should('exist');
  });

  it('author without authorizations should not be able to create a data folder', () => {
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewFolder).should('be.disabled');
  });

  it('author without authorizations should not be able to create a data document', () => {
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).should('be.disabled');
  });

  it('author without authorizations should not be able to create an address folder', () => {
    AddressPage.visit();
    cy.get(AddressPage.Toolbar.NewFolder).should('be.disabled');
  });

  it('author without authorizations should not be able to create an address document', () => {
    AddressPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).should('be.disabled');
  });

  it('if the currently logged in user has no right to access page, dashboard is shown (#3038)', () => {
    cy.visit('manage/user').then(() => {
      cy.url().should('include', 'dashboard');
    });
  });
});

// user with some limited authorizations (test_gruppe_3: Neue Testdokumente/ Ordner_2.Ebene)
describe('author with groups', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('mcloud-author-with-group');
  });

  it('search by search field in sidebar should search for the assigned data documents, be they expanded or not', () => {
    const searchTerm_1 = 'Neue Testdokumente';
    const searchTerm_2 = 'Datum_Ebene_4_4';
    const searchTerm_3 = 'TestDocResearch2';

    DocumentPage.visit();
    // make sure the not-expanded folder is found
    cy.get('ige-tree .mat-input-element').clear().click().type(searchTerm_1);
    cy.contains('mat-option .doc-item', searchTerm_1).click();
    cy.url().should('include', '/form;id=');
    cy.contains('.title .label', searchTerm_1, { timeout: 10000 });

    // make sure the nested documents are found as well
    cy.get('ige-tree .mat-input-element').clear().click().type(searchTerm_2);
    cy.contains('mat-option .doc-item', searchTerm_2).click();
    cy.url().should('include', '/form;id=');
    cy.contains('.title .label', searchTerm_2, { timeout: 7000 });

    // also: make sure the suggestions don't contain forbidden documents
    cy.get('ige-tree .mat-input-element').clear().click().type(searchTerm_3);
    cy.get('ige-tree mat-tree-node').should('not.contain', searchTerm_3);
  });

  it('search by search field in sidebar should search for the assigned address documents, be they expanded or not', () => {
    const searchTerm_2 = 'Rheinland, Adresse';
    const searchTerm_3 = 'Franken, Adresse';

    AddressPage.visit();
    // make sure the not-expanded folder is found -> Problem: search term disappears from suggestion list
    /*cy.intercept('GET', '/api/datasets?query=' + encodeURIComponent(searchTerm_1) + '&' + '**').as('searchQuery');
    cy.get('ige-tree .mat-input-element').clear().click().type(searchTerm_1);
    cy.wait('@searchQuery');
    cy.contains('mat-option .doc-item', searchTerm_1).click();
    cy.contains('.title .label', searchTerm_1);*/

    // make sure the nested documents are found as well
    cy.get('ige-tree .mat-input-element').clear().click().type(searchTerm_2);
    cy.contains('mat-option .doc-item', searchTerm_2).click();
    cy.contains('.title .label', searchTerm_2);

    // also: make sure the suggestions don't contain forbidden documents
    cy.get('ige-tree .mat-input-element').clear().click().type(searchTerm_3);
    cy.get('ige-tree mat-tree-node').should('not.contain', searchTerm_3);
  });

  it('Section "Benutzer und Rechte" should not be visible to an author (#2670)', () => {
    UserAuthorizationPage.checkUsersTabExist(false);
  });

  it('author with groups should be able to jump to documents via the "last edited"-section of the dashboard, addresses and data page', () => {
    const docName = 'Datum_Ebene_2_1';
    DocumentPage.visit();
    Tree.openNode(['Neue Testdokumente', docName]);
    DocumentPage.fillInField('[data-cy="description"]', 'textarea', 'some more text');
    DocumentPage.saveDocument();
    AddressPage.visit();
    Tree.openNode(['Ordner 2. Ebene', 'Aquitanien, Adresse']);
    AddressPage.saveDocument();

    // from dashboard page
    DashboardPage.visit();
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.get(DocumentPage.title).should('have.text', text);
    });
    // from data page
    DocumentPage.visit();
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.url().should('include', '/form;id=');
      cy.get(DocumentPage.title).should('have.text', text);
    });
    // from addresses page
    AddressPage.visit();
    DashboardPage.getLatestDocTitle(1).then(text => {
      DashboardPage.clickOnLatestDoc(1);
      cy.url().should('include', '/address;id=');
      cy.get(DocumentPage.title).should('have.text', text);
    });
  });

  it('author with groups should be able to create new address documents within the structure of his assigned documents', () => {
    // create new document
    AddressPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    // make sure that Anlegen is disabled
    cy.get('[data-cy=create-action]').should('be.disabled');
    AddressPage.addOrganizationName();
    // make sure that forbidden folder can not be chosen
    cy.get('[data-cy="create-changeLocation"]').click();
    cy.get('mat-tab-group ige-tree').should('not.contain', 'Ordner_2.Ebene_B');
    // change Folder
    Tree.openNodeInsideDialog(['Ordner 2. Ebene', 'Ordner_3.Ebene_A']);
    cy.get('[data-cy=create-applyLocation]').click();
    DocumentPage.CreateDialog.execute();
  });

  it('Author with groups should be able to create new data documents within the structure of his assigned documents', () => {
    // create new document
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    // make sure that Anlegen is disabled
    cy.get('[data-cy=create-action]').should('be.disabled');
    cy.get('[data-cy=create-title]').type('Some_Newly_Created_Doc');
    // make sure that forbidden folder can not be chosen
    cy.get('[data-cy="create-changeLocation"]').click();
    cy.get('mat-tab-group ige-tree').should('not.contain', 'Ordner_2.Ebene_B');
    // change Folder
    Tree.openNodeInsideDialog(['Neue Testdokumente', 'Ordner_Ebene_2C']);
    cy.get('[data-cy=create-applyLocation]').click();
    cy.get('[data-cy=create-action]').click();
    // search for the newly created document
    ResearchPage.visit();
    ResearchPage.search('Some_Newly_Created_Doc');
    //ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.getSearchResultCount().should('be.gt', 0);
  });

  it('Author with groups can see his own user profile', () => {
    DashboardPage.visit();
    UserAuthorizationPage.accessUserProfile();
    cy.get(UserAuthorizationPage.ProfileElements.Title).should('have.text', ' Autor_mitGruppen ');
    cy.get(UserAuthorizationPage.ProfileElements.Groups).should('have.text', ' test_gruppe_3 ');
    cy.get(UserAuthorizationPage.ProfileElements.FirstName).should('have.text', 'Autor_mit');
    cy.get(UserAuthorizationPage.ProfileElements.LastName).should('have.text', 'Gruppen');
    cy.get(UserAuthorizationPage.ProfileElements.Email).should('have.text', 'autormitgruppen@random.com');
  });
});