import { AdminUserPage } from '../../pages/administration-user.page';
import { DocumentPage, ROOT } from '../../pages/document.page';
import { UserAndRights } from '../../pages/base.page';
import { ResearchPage, SearchOptionTabs } from '../../pages/research.page';
import { AddressPage } from '../../pages/address.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';
import { Utils } from '../../pages/utils';
import { Tree } from '../../pages/tree.partial';

// user without authorizations (author)
describe('User without authorizations', () => {
  beforeEach(() => {
    cy.kcLogin('autor');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  xit('user without authorization should be able to prompt SQL search by button but should not be shown any results (#3459)', () => {
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    ResearchPage.getSearchResultCount().should('equal', 0);
  });

  it('Section "Nutzer und Rechte" should not be visible to author (#2670)', () => {
    cy.visit('user');
    cy.get('mat-nav-list').find('.mat-list-item').should('not.contain', 'Nutzer & Rechte');
  });

  it('Erweiterte Suche should show no search result to user without authorization, neither before nor after typing in search term', () => {
    // Make sure search page shows no data when visiting
    ResearchPage.visit();
    ResearchPage.getSearchResultCountZeroIncluded().should('equal', 0);
    // Make sure triggering search doesn't deliver search results
    ResearchPage.search('test');
    ResearchPage.getSearchResultCountZeroIncluded().should('equal', 0);
  });

  it('Should be shown blank dashboard', () => {
    DashboardPage.visit();
    cy.contains('In Bearbeitung').parent().contains('0');
    cy.contains('Veröffentlicht').parent().contains('0');
    cy.get('text.text').contains('0');
  });

  it('Author should see neither documents nor addresses', () => {
    DocumentPage.visit();
    // if there are data to show, ige-tree has two children: the navigation board and the tree with the items
    cy.get('ige-tree').children().should('have.length', 1);
    AddressPage.visit();
    // if there are addresses to show, ige-tree has two children: the navigation board and the tree with the items
    cy.get('ige-tree').children().should('have.length', 1);
  });

  it('author without authorizations should not be able to create a data folder', () => {
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    // try to create piece of data as root document
    cy.get('[data-cy=create-title]').type('try_new_folder');
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
    // try to create piece of data as part of a tree hierarchy
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText('Daten');
    UserAuthorizationPage.tryChangeFolderwithoutFoldersAccessible();
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
  });

  it('author without authorizations should not be able to create a data document', () => {
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    // try to create piece of data as root document
    cy.get('[data-cy=create-title]').type('try_new_doc');
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
    // try to create piece of data as part of a tree hierarchy
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText('Daten');
    UserAuthorizationPage.tryChangeFolderwithoutFoldersAccessible();
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
  });

  it('author without authorizations should not be able to create an address folder', () => {
    AddressPage.visit();
    cy.get(AddressPage.Toolbar.NewFolder).click();
    // try to create piece of data as root document
    cy.get('[data-cy=create-title]').type('try_new_folder');
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
    // try to create piece of data as part of a tree hierarchy
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText('Adressen');
    UserAuthorizationPage.tryChangeFolderwithoutFoldersAccessible();
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
  });

  it('author without authorizations should not be able to create an address document', () => {
    AddressPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    // try to create piece of data as root document
    AddressPage.type('create-address-firstName', 'some first name');
    AddressPage.type('create-address-lastName', 'some last name');
    AddressPage.type('create-address-organization', 'some organization');
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
    // try to create piece of data as part of a tree hierarchy
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText('Adressen');
    UserAuthorizationPage.tryChangeFolderwithoutFoldersAccessible();
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
  });
});

// meta data administrator without groups
describe('Meta data administrator without groups', () => {
  beforeEach(() => {
    cy.kcLogin('meta');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('meta data administrator without groups should see neither documents nor addresses', () => {
    DocumentPage.visit();
    // if there are data to show, ige-tree has two children: the navigation board and the tree with the items
    cy.get('ige-tree').children().should('have.length', 1);
    AddressPage.visit();
    // if there are addresses to show, ige-tree has two children: the navigation board and the tree with the items
    cy.get('ige-tree').children().should('have.length', 1);
  });

  it('should show no groups to a metadata-administrator without groups', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.get('.user-management-header').contains('Gruppen (0)');
  });
  //evtl neuer Test: Nutzerverwaltung ist zugänglich, aber keine Gruppen/User
});

// meta data administrator with groups
describe('Meta data administrator with a group', () => {
  beforeEach(() => {
    cy.kcLogin('meta2');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  // functionality not yet working
  xit('meta data administrator with group should be able to see the addresses of his group and search for it', () => {
    AddressPage.visit();
    // Look for a document that belongs to the admin's group
    cy.get('mat-tree.mat-tree').contains('test_c, test_c');
    ResearchPage.visit();
    ResearchPage.search('test_c');
    ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.getSearchResultCount().should('equal', 1);
  });

  // Admin sieht leere Gruppen nur, wenn er sie selbst erstellt hat
  it('meta data administrator with group(s) should see his group(s)', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.get('groups-table').contains('gruppe_mit_ortsrechten').click();
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
  });

  // problem: profile has to be updated with necessary data once the editing is started
  xit('meta data admin should be able to edit an address of one of his assigned groups', () => {
    AddressPage.visit();
    cy.get('mat-tree.mat-tree').contains('test_c, test_c').click();
    cy.get('formly-form input').eq(6).clear().type('some street');
    cy.contains('.save-buttons', 'Speichern').click();
  });

  // problem above: necessary data has to be added (at least for the time being)
  xit('meta data admin with groups should not be able to edit an address of one of his assigned groups if access is read-only', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.get('groups-table').contains('gruppe_mit_ortsrechten').click();
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    cy.get('[label="Berechtigungen Adressen"]')
      .contains('test_z')
      .parent()
      .parent()
      .within(() => {
        cy.get('.right-button.active');
        cy.get('.left-button').click();
        cy.get('.left-button.active');
      });
    AddressPage.visit();
    cy.get('mat-tree.mat-tree').contains('test_z, test_z').click();
    cy.get('formly-form input').eq(7).clear().type('some number');
    cy.contains('.save-buttons', 'Speichern').click();
  });

  xit('meta data admin should be able to add documents to groups and set access modes', () => {});

  xit('when "nur Unterordner" is activated, the overarching folder should not be able to be deleted', () => {});

  xit('when "nur Unterordner" is activated, the overarching folder should not be able to be renamed', () => {});

  xit('when "nur Unterordner" is activated, the overarching folder should not be able to be relocated', () => {});

  xit('meta data admin should not be able to create a root document', () => {});

  xit('meta data admin should only be able to create documents or folders as children of folders he is entitled to', () => {});
});

// catalogue admin
describe('Catalogue admin', () => {
  beforeEach(() => {
    cy.kcLogin('eins');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  xit('catalogue admin should be able to create root documents', () => {});

  it('catalogue admin should be able to see everything', () => {
    //Dashboard should give overview of data
    DashboardPage.visit();
    cy.contains('In Bearbeitung').parent().should('not.contain', 0);
    cy.contains('Veröffentlicht').parent().should('not.contain', 0);
    cy.get('text.text').should('not.contain', 0);

    //Documents and addresses should be present
    DocumentPage.visit();
    // if there are data to show, ige-tree has two children: the navigation board and the tree with the items
    cy.get('ige-tree').children().should('have.length', 2);
    AddressPage.visit();
    // if there are addresses to show, ige-tree has two children: the navigation board and the tree with the items
    cy.get('ige-tree').children().should('have.length', 2);
    //Users and groups should be present
    cy.visit('user');
    cy.get('mat-nav-list').find('.mat-list-item').should('contain', 'Nutzer & Rechte');
    AdminUserPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.getNumberOfUsers().should('be.greaterThan', 0);
    cy.intercept('/api/groups').as('loadingGroups');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.wait('@loadingGroups');
    AdminUserPage.getNumberOfGroups().should('be.greaterThan', 0);
  });

  // eigentlich egal, welcher User -> nur Recht, Gruppen Dokumente zuzuweisen nötig
  xit('it should not be possible to add a piece of data twice to a group (#3461)', () => {});
});
