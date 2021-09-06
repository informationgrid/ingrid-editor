import { AdminUserPage } from '../../pages/administration-user.page';
import { DocumentPage } from '../../pages/document.page';
import { UserAndRights } from '../../pages/base.page';
import { ResearchPage, SearchOptionTabs } from '../../pages/research.page';
import { AddressPage } from '../../pages/address.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';
import { Tree } from '../../pages/tree.partial';
import { AdminGroupPage } from '../../pages/administration-group.page';
import { User } from '../../../../src/app/+user/user';
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

  it('metadata admin without groups should be able to create group of his own, but not add documents', () => {
    // create group
    const newGroup = 'new_empty_group';
    const description = 'group for metadata-admin without groups';

    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.addNewGroup(newGroup);
    AdminGroupPage.addGroupDescription(description);
    AdminGroupPage.toolbarSaveGroup();
    AdminGroupPage.verifyNewlyCreatedGroup(newGroup, description);
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

  xit('metadata admin without groups should not be able to change responsible person of groups', () => {});
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
    cy.get('[data-cy="toolbar_SAVE"]').click();
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
    CopyCutUtils.move();
    cy.get('error-dialog').contains('keine Berechtigung');

    // try to delete
    DocumentPage.deleteLoadedNode();
    cy.get('error-dialog').contains('keine Berechtigung');

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromReadToWrite('test_z, test_z', 'Adressen');
  });

  // Problem: Server-Error bei Versuch, datensatz zu löschen
  xit('meta data admin with groups should not be able to edit/move/delete a data document of his assigned groups if access is read-only (#2778)', () => {
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
    CopyCutUtils.move();
    cy.get('error-dialog').contains('keine Berechtigung');

    // try to delete
    DocumentPage.deleteLoadedNode();
    cy.get('error-dialog').contains('keine Berechtigung');

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromReadToWrite('Ordner_Ebene_2C', 'Daten');
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

  xit('when "nur Unterordner" is activated, the overarching folder should not be able to be renamed', () => {
    // set access right to "nur Unterordner"
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_Ebene_2C', 'Daten');
    // open document
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2C']);
    UserAuthorizationPage.verifyDocumentTitle('Ordner_Ebene_2C');
    // change title
    UserAuthorizationPage.changeTitle('just_another_title');
    // try to save
    cy.get(DocumentPage.Toolbar['Save']).click();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();
  });

  // kann leider noch verschoben werden
  xit('when "nur Unterordner" is activated, the overarching folder should not be able to be relocated', () => {
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

  xit('meta data admin should not be able to move documents to a root document (#2775)', () => {
    DocumentPage.visit();
    // try to move by dialogue
    Tree.openNode(['Ordner_Ebene_2A']);
    CopyCutUtils.move();
    //expect error
    cy.contains('error-dialog', 'Sie haben keine Berechtigung für diese Aktion.');

    // todo: try to move via drag and drop
    // problem: item can not simply be dragged from origin to destination, because destination only becomes visible after starting to drag
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

  xit('meta data admin should be able to see the groups and users of metadata admins he has created (and so on recursively)', () => {});

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
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    // grant authorization for an address
    AdminGroupPage.addDocumentToGroup('test_j, test_j', 'Adressen');
    cy.get('permission-table[label="Berechtigungen Adressen"]').should('contain', 'test_c, test_c');
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
});
