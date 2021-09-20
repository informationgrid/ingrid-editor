import { AdminUserPage, keysInHeader } from '../../pages/administration-user.page';
import { DocumentPage } from '../../pages/document.page';
import { UserAndRights } from '../../pages/base.page';
import { ResearchPage, SearchOptionTabs } from '../../pages/research.page';
import { Address, AddressPage } from '../../pages/address.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';
import { Tree } from '../../pages/tree.partial';
import { AdminGroupPage, headerKeys } from '../../pages/administration-group.page';
import { CopyCutUtils } from '../../pages/copy-cut-utils';
import Doc = Mocha.reporters.Doc;

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

// user with some limited authorizations (test_gruppe_3: Neue Testdokumente/ Ordner_2.Ebene)
describe('author with groups', () => {
  beforeEach(() => {
    cy.kcLogin('autor2');
  });

  afterEach(() => {
    cy.kcLogout();
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
    cy.get('mat-option .doc-item').should('not.contain', searchTerm_3).click();
  });

  it('search by search field in sidebar should search for the assigned address documents, be they expanded or not', () => {
    const searchTerm_1 = 'Ordner 2.Ebene';
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
    cy.get('mat-option .doc-item').should('not.contain', searchTerm_3).click();
  });

  it('Section "Nutzer und Rechte" should not be visible to author with groups', () => {
    cy.visit('user');
    cy.get('mat-nav-list').find('.mat-list-item').should('not.contain', 'Nutzer & Rechte');
  });

  it('author with groups should be able to jump to documents via the "last edited"-section of the dashboard, addresses and data page', () => {
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
    AddressPage.type('create-address-firstName', 'Adresse');
    AddressPage.type('create-address-lastName', 'Galizien');
    // make sure that forbidden folder can not be chosen
    cy.get('[data-cy="create-changeLocation"]').click();
    cy.get('mat-tab-group ige-tree').should('not.contain', 'Ordner_2.Ebene_B');
    // change Folder
    Tree.openNode(['Ordner 2. Ebene', 'Ordner_3.Ebene_A'], true);
    cy.get('[data-cy=create-applyLocation]').click();
    DocumentPage.CreateDialog.execute();
  });

  xit('author with groups should be able to create new data documents within the structure of his assigned documents', () => {
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
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2C'], true);
    cy.get('[data-cy=create-applyLocation]').click();

    // search for the newly created document
    ResearchPage.visit();
    ResearchPage.search('Some_Newly_Created_Doc');
    //ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.getSearchResultCount().should('equal', 1);
  });

  it('Author with groups can see his own user profile', () => {
    DashboardPage.visit();
    cy.get('[data-cy="header-profile-button"]').click();
    cy.contains('[role="menuitem"]', 'Profil verwalten').click();
    cy.get(UserAuthorizationPage.ProfileElements.Title).should('have.text', ' Autor_mitGruppen ');
    cy.get(UserAuthorizationPage.ProfileElements.Groups).should('have.text', ' test_gruppe_3 ');
    cy.get(UserAuthorizationPage.ProfileElements.FirstName).should('have.text', 'Autor_mit');
    cy.get(UserAuthorizationPage.ProfileElements.LastName).should('have.text', 'Gruppen');
    cy.get(UserAuthorizationPage.ProfileElements.Email).should('have.text', 'autormitgruppen@random.com');
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

  it('meta data administrator without groups should see neither documents nor addresses (#2635)', () => {
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

  it('metadata admin without groups should be able to create groups of his own, but not add documents', () => {
    // create group
    const newGroup = 'new_empty_group';
    const description = 'group for metadata-admin without groups';

    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.addNewGroup(newGroup);
    AdminGroupPage.addGroupDescription(description);
    AdminGroupPage.toolbarSaveGroup();
    AdminGroupPage.verifyNewlyCreatedGroup(newGroup, description);
    AdminGroupPage.verifyInfoInHeader(headerKeys.Manager, 'meta');
    // try to add documents
    AdminGroupPage.selectGroup(newGroup);
    AdminGroupPage.openAddDocumentsDialog('Adressen');
    cy.get('permission-add-dialog').should('contain', 'Leer');
  });

  it('metadata admin without groups should not be able to create documents', () => {
    // data documents
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    cy.get('.root .disabled');
    // try to create data folder
    cy.get('[data-cy=create-title]').type('letsTypeSomething');
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();
    // try to create piece of data as part of a tree hierarchy
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText('Daten');
    UserAuthorizationPage.tryChangeFolderwithoutFoldersAccessible();
    UserAuthorizationPage.tryIllegitimateCreate();
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');
    UserAuthorizationPage.closeErrorBox();

    // addresses
    AddressPage.visit();
    cy.get(AddressPage.Toolbar.NewFolder).click();
    cy.get('.root .disabled');
    // try to create an address folder
    cy.get('[data-cy=create-title]').type('letsTypeSomething');
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

  xit('metadata admin without groups should be able to change manager of users', () => {});
});

// meta data administrator with groups
describe('Meta data administrator with a group', () => {
  beforeEach(() => {
    cy.kcLogin('meta2');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('meta data administrator with group should be able to see the addresses of his group and search for it', () => {
    AddressPage.visit();
    // Look for a document that belongs to the admin's group
    Tree.openNode(['Ordner_2.Ebene_C', 'Harz, Adresse']);
    ResearchPage.visit();
    ResearchPage.search('Harz');
    ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.getSearchResultCount().should('equal', 1);
  });

  it('meta data administrator with group should be able to see the data of his group and search for it', () => {
    DocumentPage.visit();
    // Look for a document that belongs to the admin's group
    Tree.openNode(['Ordner_Ebene_2A', 'Datum_Ebene_3_3']);
    ResearchPage.visit();
    ResearchPage.search('Datum_Ebene_3_3');
    ResearchPage.getSearchResultCount().should('equal', 1);
  });

  it('meta data administrator with group(s) should see his group(s)', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    // check for existence of one of user's groups
    cy.get('groups-table').contains('gruppe_mit_ortsrechten').click();
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    // check for existence of group not belonging to user
    cy.get('groups-table').should('not.contain', 'test_gruppe_2');
  });

  it('meta data administrator should be able to open documents that belongs to one of his groups', () => {
    AddressPage.visit();
    Tree.openNode(['test_c, test_c']);
    cy.contains('ige-header-title-row', 'test_c, test_c');
  });

  it('meta data admin should be able to edit an address of his assigned groups', () => {
    AddressPage.visit();
    Tree.openNode(['Ordner_3.Ebene_C', 'Pays-Basque, Adresse']);
    AddressPage.addContact();
    AddressPage.addTitleToProfile('Dr.');
    cy.wait(500);
    AddressPage.saveChangesOfProfile('Pays-Basque, Adresse');

    // open a random address
    Tree.openNode(['Aquitanien, Adresse']);
    // come back to initial, edited address and make sure it has been changed
    Tree.openNode(['Ordner_3.Ebene_C', 'Pays-Basque, Adresse']);
    cy.contains('.mat-select-trigger', 'Dr.');
  });

  it('meta data admin should be able to edit data documents of his assigned groups', () => {
    const description = 'This is the description of document 4_1';
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    DocumentPage.addDescription(description);
    DocumentPage.saveProfile('Datum_Ebene_4_1');
    // open a random document
    Tree.openNode(['Ordner_Ebene_2A', 'Datum_Ebene_3_3']);
    // come back to initial, edited document and make sure it has been changed
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3A', 'Datum_Ebene_4_1']);
    cy.get('.ng-star-inserted textarea').eq(1).should('have.value', description);
  });

  it('meta data admin with groups should not be able to edit/move/delete an address of his assigned groups if access is read-only', () => {
    // set access right to read-only
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead('test_z, test_z', 'Adressen');
    AdminGroupPage.toolbarSaveGroup();

    // try to edit
    AddressPage.visit();
    Tree.openNode(['test_z, test_z']);
    // if editing is forbidden, the form fields are disabled
    cy.get('mat-form-field.mat-form-field-disabled');

    // try to move the address
    CopyCutUtils.move(['Ordner_2.Ebene_C']);
    cy.get('error-dialog').contains('keine Berechtigung');

    // try to delete
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromReadToWrite('test_z, test_z', 'Adressen');
  });

  it('meta data admin with groups should not be able to edit/move/delete a data document of his assigned groups if access is read-only (#2778)', () => {
    // set access to read-only
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromWriteToRead('Ordner_Ebene_2C', 'Daten');
    AdminGroupPage.toolbarSaveGroup();

    // try to edit
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2C', 'Ordner_Ebene_3C', 'Datum_Ebene_4_5']);
    // if editing is forbidden, the form fields are disabled
    cy.get('mat-form-field.mat-form-field-disabled');

    // try to move
    CopyCutUtils.move(['Ordner_Ebene_2A']);
    cy.get('error-dialog').contains('keine Berechtigung');

    // try to delete
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromReadToWrite('Ordner_Ebene_2C', 'Daten');
  });

  it('meta data admin with groups should not be able to move a data document to a read-only folder', () => {
    const readOnlyFolder = 'Ordner_Ebene_2C';
    const folderToMove = 'Ordner_Ebene_3A';
    const documentToMove = 'Datum_Ebene_3_3';

    // set access to read-only
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(readOnlyFolder, 'Daten');
    AdminGroupPage.toolbarSaveGroup();

    // try to move a folder to the read-only folder
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2A', folderToMove]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPYTREE"]').click();
    cy.contains('mat-dialog-content', readOnlyFolder).should('not.exist');

    // try to move this folder via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(folderToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();

    // try to move a document to the read-only folder
    Tree.openNode(['Ordner_Ebene_2A', documentToMove]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    cy.contains('mat-dialog-content', readOnlyFolder).should('not.exist');

    // try to move this document via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(documentToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromReadToWrite(readOnlyFolder, 'Daten');
    AdminGroupPage.toolbarSaveGroup();
  });

  it('meta data admin with groups should not be able to move an address document to a read-only folder', () => {
    const readOnlyFolder = 'Ordner_3.Ebene_C';
    const folderToMove = 'Ordner_2.Ebene_C';
    const documentToMove = 'Aquitanien, Adresse';

    // set access to read-only
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(readOnlyFolder, 'Adressen');
    AdminGroupPage.toolbarSaveGroup();

    // try to move a folder to the read-only folder
    AddressPage.visit();
    Tree.openNode([folderToMove]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPYTREE"]').click();
    cy.contains('mat-dialog-content', readOnlyFolder).should('not.exist');

    // try to move this folder via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(folderToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();

    // try to move a document to the read-only folder
    Tree.openNode([documentToMove]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    cy.contains('mat-dialog-content', readOnlyFolder).should('not.exist');

    // try to move document via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(documentToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromReadToWrite(readOnlyFolder, 'Adressen');
    AdminGroupPage.toolbarSaveGroup();
  });

  it('a meta data admin can only add those documents to his groups to which he is entitled to', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.openAddDocumentsDialog('Adressen');
    // make sure the not-addable document is not in the list of the add dialogue
    cy.contains('mat-tree-node', 'Elsass, Adresse').should('not.exist');
  });

  it('meta data admin should be able to add documents to groups', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.addDocumentToGroup('Franken, Adresse', 'Adressen');
    cy.get('permission-table[label="Berechtigungen Adressen"]').should('contain', 'Franken, Adresse');
  });

  it('when "nur Unterordner" is activated, the overarching folder should not be able to be deleted (#2785)', () => {
    // set access right to "nur Unterordner"
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_3.Ebene_C', 'Adressen');
    // open document
    AddressPage.visit();
    Tree.openNode(['Ordner_3.Ebene_C']);
    UserAuthorizationPage.verifyDocumentTitle('Ordner_3.Ebene_C');
    // first delete documents present in the folder
    cy.get('mat-tree-node[aria-level="2"]').each(element => {
      cy.wrap(element).click();
      DocumentPage.deleteLoadedNode();
    });
    // try to delete the folder: expect delete button to be disabled
    Tree.openNode(['Ordner_3.Ebene_C']);
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');
  });

  it('when "nur Unterordner" is activated, the overarching folder should not be able to be renamed', () => {
    // set access right to "nur Unterordner"
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_Ebene_2C', 'Daten');
    // open document
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2C']);
    UserAuthorizationPage.verifyDocumentTitle('Ordner_Ebene_2C');
    // try to change title
    cy.get('.title .label').should('not.have.class', 'editable');
    cy.get(DocumentPage.Toolbar['Save']).should('be.disabled');
  });

  it('meta data admin should not be able to move documents to a root document (#2775)', () => {
    // I. Daten
    const rootFolder_1 = 'Daten';
    DocumentPage.visit();
    // try to move
    Tree.openNode(['Ordner_Ebene_2A']);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').click();
    cy.contains('mat-dialog-content mat-tree-node', rootFolder_1).should('not.exist');

    // II. Adressen
    const rootFolder_2 = 'Daten';
    AddressPage.visit();
    // try to move
    Tree.openNode(['Ordner_2.Ebene_C']);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').click();
    cy.contains('mat-dialog-content mat-tree-node', rootFolder_2).should('not.exist');
  });

  it('when "nur Unterordner" is activated, the overarching folder should not be able to be relocated', () => {
    // set access right to "nur Unterordner"
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_Ebene_2C', 'Daten');
    AdminGroupPage.toolbarSaveGroup();
    // open document
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2C']);
    UserAuthorizationPage.verifyDocumentTitle('Ordner_Ebene_2C');
    // try to move via dialogue
    CopyCutUtils.move(['Ordner_Ebene_2A']);
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    // close error box
    UserAuthorizationPage.closeErrorBox();

    // try to move via drag and drop
    CopyCutUtils.simpleDragdropWithoutAutoExpand('Ordner_Ebene_2C', 'Ordner_Ebene_2A');
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
  });

  it('meta data admin should not be able to create a root document/address', () => {
    // try to create data folder
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    cy.get('.root .disabled');

    // try to create address folder
    AddressPage.visit();
    cy.get(AddressPage.Toolbar.NewFolder).click();
    cy.get('.root .disabled');
  });

  it('meta data admin should only be able to create documents or folders as children of folders he is entitled to', () => {
    // create new document
    AddressPage.visit();
    Tree.openNode(['Ordner_2.Ebene_C', 'Ordner_3.Ebene_F']);
    cy.get(DocumentPage.Toolbar.NewFolder).click();

    // make sure the parts of the path that point to not-allowed folders are disabled
    cy.get('mat-tab-group .mat-tooltip-trigger')
      .filter('.disabled')
      .then(items => {
        expect(items[0]).to.contain.text('Adressen');
        expect(items[1]).to.contain.text('Neue Testadressen');
      });

    // try to switch to forbidden folder
    cy.get('[data-cy=create-changeLocation]').click();
    cy.get('mat-tab-group').should('not.contain', 'Neue Testadressen');
  });

  it('meta data admin should be able to create authors', () => {
    cy.visit('user');
    cy.contains('button', 'Hinzufügen').click();
    AdminUserPage.addNewUserLogin('some_random_authorLogin');
    AdminUserPage.addNewUserFirstname('random');
    AdminUserPage.addNewUserLastname('author');
    AdminUserPage.addNewUserEmail('test@thisauthor.com');
    AdminUserPage.addNewUserRole('Autor');
    cy.contains('button', 'Anlegen').should('be.enabled');
    AdminUserPage.confirmAddUserDialog();
  });

  xit('meta data admin should be able to create other metadata administrators and assign them groups', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'gruppe_mit_ortsrechten';
    //create user
    cy.visit('user');
    cy.contains('button', 'Hinzufügen').click();
    AdminUserPage.addNewUserLogin('meta4');
    AdminUserPage.addNewUserFirstname('Metadaten');
    AdminUserPage.addNewUserLastname('Vier');
    AdminUserPage.addNewUserEmail('MD4@wemove.com');
    AdminUserPage.addNewUserRole('Metadaten-Administrator');
    cy.get('button').contains('Anlegen').parent().should('not.be.disabled');
    AdminUserPage.confirmAddUserDialog();
    //assign groups to user
    AdminUserPage.addGroupToUser(groupName);
    cy.get('[data-cy=Gruppen]').should('contain', groupName);
    AdminUserPage.addGroupToUser(groupName2);
    cy.get('[data-cy=Gruppen]').should('contain', groupName2);
    AdminUserPage.toolbarSaveUser();
    // log in as user and make sure groups are available; (geht erst, wenn Email-Versand klappt)
    cy.writeFile('cypress/fixtures/users/meta4.json', { username: 'meta4', password: 'meta4' });
    cy.kcLogout();
    cy.kcLogin('meta4');
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup(groupName);
    AdminGroupPage.selectGroup(groupName2);
    cy.kcLogout();
  });

  xit('meta data admin should be able to see the groups and users of metadata admins he has created (and so on recursively)', () => {
    // create a user, assign groups, let this user assign groups, then check access to documents
  });

  xit('meta data admin should have the same access right to documents further down in the tree as the users to which the access rights were granted', () => {});

  it('meta data admin should be able to create groups', () => {
    const newGroup = 'some_new_group';
    const description = 'something of a description';

    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.addNewGroup(newGroup);
    AdminGroupPage.addGroupDescription(description);
    AdminGroupPage.toolbarSaveGroup();
    AdminGroupPage.verifyNewlyCreatedGroup(newGroup, description);
  });

  it('if a meta data admin deletes a document from one of his groups, he cannot access this document anymore (neither write nor read)', () => {
    // delete address from group and check existence
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.deleteDocumentFromGroup('test_c, test_c', 'Adressen');
    AdminGroupPage.toolbarSaveGroup();
    // Go to "Addresses" and make sure the address is not there anymore
    AddressPage.visit();
    cy.get('ige-sidebar').should('not.contain', 'test_c, test_c');
    // Go to Research section and make sure search doesn't return removed document
    ResearchPage.visit();
    ResearchPage.search('test_c, test_c');
    ResearchPage.getSearchResultCountZeroIncluded().should('eq', 0);
  });

  it('if metadata admin deletes one of his assigned groups, he should not be able to see the documents of this group', () => {
    // delete a group
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.deleteGroup('gruppe_mit_ortsrechten');
    // make sure documents are not accessible anymore
    DocumentPage.visit();
    cy.contains('mat-tree.mat-tree', 'Ordner_Ebene_2A').should('not.exist');
    AddressPage.visit();
    cy.contains('mat-tree.mat-tree', 'test_z, test_z').should('not.exist');
  });

  it('meta data administrator should be able to jump to documents via the "last edited"-section of the dashboard, addresses and data page', () => {
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

  xit('metadata admin should not be able to see the users other metadata admins created', () => {});
});

// catalogue admin
describe('Catalogue admin', () => {
  beforeEach(() => {
    cy.kcLogin('eins');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  // eigentlich egal, welcher User -> nur Recht, Gruppen Dokumente zuzuweisen nötig
  it('it should not be possible to add a piece of data twice to a group (#3461)', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_5');
    // grant authorization for an address
    AdminGroupPage.addDocumentToGroup('test_j, test_j', 'Adressen');
    cy.get('permission-table[label="Berechtigungen Adressen"]').should('contain', 'test_j, test_j');
    // try to grant authorizations for addresses twice
    AdminGroupPage.tryIllegitimateAddToGroup('test_j, test_j', 'Adressen');
    cy.contains('button', 'Abbrechen').click();
    // grant authorization for a piece of data
    AdminGroupPage.addDocumentToGroup('TestDocResearch4', 'Daten');
    cy.get('permission-table[label="Berechtigungen Daten"]').should('contain', 'TestDocResearch4');
    // try to grant authorization for data twice
    AdminGroupPage.tryIllegitimateAddToGroup('TestDocResearch4', 'Daten');
  });

  it('catalogue admin should be able to create root documents', () => {
    // create root document
    DocumentPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText('Daten');
    cy.get('[data-cy=create-title]').type('new_root_doc');
    cy.get('[data-cy=create-action]').should('be.enabled').click();
    Tree.containsNodeWithObjectTitle('new_root_doc');
    cy.get(DocumentPage.title).should('have.text', 'new_root_doc');

    // create root address
    AddressPage.visit();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(`Adressen`);
    cy.get('[data-cy=create-address-firstName]').type('Hans');
    cy.get('[data-cy=create-address-lastName]').type('Müller');
    cy.get('[data-cy=create-address-organization]').type('Irgendeine_organisation');
    cy.get('[data-cy=create-action]').click();
    cy.get('.firstName input').should('have.value', 'Hans');
    cy.get('.lastName input').should('have.value', 'Müller');
    DocumentPage.title = 'Irgendeine_organisation, Müller, Hans';
  });

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

  it('catalogue admin can see empty groups', () => {
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('leere_Gruppe');
    cy.get('.user-title').contains('leere_Gruppe');
  });

  it('catalog admin should be able to take responsibility from a user away and choose a new manager', () => {
    const login = 'meta';
    cy.visit('user');
    AdminUserPage.selectUser('Test Verantwortlicher');
    // take responsibility away from a user
    AdminUserPage.cedeResponsibility('Meta Admin');
    // check if users of the old manager now belong to the new manager
    AdminUserPage.selectUser('autor2');
    AdminUserPage.verifyInfoInHeader(keysInHeader.Manager, 'Meta Admin');
  });

  // maybe additional to the test that checks if number of users is greater than 0?
  xit('should show all the groups to a catalogue admin (#2670)', () => {});
});
