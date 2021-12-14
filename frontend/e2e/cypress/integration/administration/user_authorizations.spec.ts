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
import { Utils } from '../../pages/utils';

// meta data administrator without groups
describe('Meta data administrator without groups', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('meta');
  });

  it('meta data administrator without groups should see neither documents nor addresses (#2635)', () => {
    DocumentPage.visit();
    // check if no documents are listed
    cy.get('ige-tree ige-empty-navigation');
    AddressPage.visit();
    // check if no data are listed
    cy.get('ige-tree ige-empty-navigation');
  });

  it('should show no groups to a metadata-administrator without groups', () => {
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.get('.user-management-header').contains('Gruppen (0)');
  });
  it('metadata admin without groups should be able to create groups of his own, but not add documents', () => {
    // create group
    const newGroup = 'new_empty_group';
    const description = 'group for metadata-admin without groups';

    AdminUserPage.visit();
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
    cy.get('[data-cy="toolbar_CREATE_FOLDER"]').click();
    cy.get('.error-box').contains('Sie haben keine Schreibrechte auf den Zielordner');
    DocumentPage.CreateDialog.cancel();
    cy.get('[data-cy="toolbar_NEW_DOC"]').click();
    cy.get('.error-box').contains('Sie haben keine Schreibrechte auf den Zielordner');
    // addresses
    AddressPage.visit();
    cy.get('[data-cy="toolbar_CREATE_FOLDER"]').click();
    cy.get('.error-box').contains('Sie haben keine Schreibrechte auf den Zielordner');
  });

  it('user without authorization should be able to prompt SQL search by button but should not be shown any results (#3459)', () => {
    ResearchPage.visit();
    ResearchPage.openSearchOptionTab(SearchOptionTabs.SQLSearch);
    cy.contains('div.mat-chip-list-wrapper > mat-chip.mat-chip', 'Adressen, mit Titel "test"').click();
    ResearchPage.checkNoSearchResults();
  });

  it('Erweiterte Suche should show no search result to user without authorization, neither before nor after typing in search term', () => {
    // Make sure search page shows no data when visiting
    ResearchPage.visit();
    cy.get('.result').contains('0 Ergebnisse gefunden');
    // Make sure triggering search doesn't deliver search results
    ResearchPage.search('test');
    ResearchPage.checkNoSearchResults();
  });

  it('should not show any object nor address to a metadata administrator without an assigned group (#2672)', () => {
    // Go to data section and make sure no single data is displayed
    DocumentPage.visit();
    cy.get('ige-form-dashboard').contains('Kein Ordner oder Datensatz vorhanden');
    // Also: make sure no data is displayed in the data list
    cy.get('ige-tree').contains('Leer');

    // Go to address section and make sure no single address is displayed
    AddressPage.visit();
    cy.get('ige-address-dashboard').contains('Kein Ordner oder Adresse vorhanden');
    // Also: make sure no address is displayed in the address list
    cy.get('ige-tree').contains('Leer');
  });
});

// meta data administrator with groups
describe('Meta data administrator with a group', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('meta2');
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
    AdminUserPage.visit();
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
    // works right now, changes necessary -> either add organisation in test or adjust db
    AddressPage.visit();
    //Tree.openNode(['Ordner_3.Ebene_C', 'Pays-Basque, Adresse']);
    AddressPage.createAddress(new Address('Organisation_2', '', ''), ['Ordner_2.Ebene_C']);
    Tree.openNode(['Ordner_2.Ebene_C', 'Organisation_2']);
    AddressPage.addContact();
    /*AddressPage.addTitleToProfile('Dr.');*/
    cy.wait(500);
    AddressPage.saveChangesOfProfile('Organisation_2');

    // open a random address
    Tree.openNode(['Aquitanien, Adresse']);
    // come back to initial, edited address and make sure it has been changed
    Tree.openNode(['Ordner_2.Ebene_C', 'Organisation_2']);
    cy.contains('.required ige-repeat', 'Telefon');
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
    AdminUserPage.visit();
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

    // try to move the address, expect move button to be disabled
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').should('be.disabled');

    // try to delete
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');

    // set access right back to 'write'
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromReadToWrite('test_z, test_z', 'Adressen');
    AdminGroupPage.toolbarSaveGroup();
  });

  it('meta data admin with groups should not be able to move an address document to a read-only folder', () => {
    const readOnlyFolder = 'Ordner_3.Ebene_C';
    const folderToMove = 'Ordner_2.Ebene_C';
    const documentToMove = 'Aquitanien, Adresse';

    // set access to read-only
    AdminUserPage.visit();
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
    cy.get('[data-cy="dlg-close"]').click();

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
    cy.get('[data-cy="dlg-close"]').click();

    // try to move document via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(documentToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();

    // set access right back to 'write'
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    cy.get('.user-title').contains('gruppe_mit_ortsrechten');
    UserAuthorizationPage.changeAccessRightFromReadToWrite(readOnlyFolder, 'Adressen');
    AdminGroupPage.toolbarSaveGroup();
  });

  it('a meta data admin can only add those documents to his groups to which he is entitled to', () => {
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.openAddDocumentsDialog('Adressen');
    // make sure the not-addable document is not in the list of the add dialogue
    cy.contains('mat-tree-node', 'Elsass, Adresse').should('not.exist');
  });

  it('meta data admin should be able to add documents to groups', () => {
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.addDocumentToGroup('Franken, Adresse', 'Adressen');
    cy.get('permission-table[label="Berechtigungen Adressen"]').should('contain', 'Franken, Adresse');
  });

  it('when "nur Unterordner" is activated, the overarching folder should not be able to be deleted (#2785)', () => {
    // set access right to "nur Unterordner"
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_3.Ebene_C', 'Adressen');
    AdminGroupPage.toolbarSaveGroup();
    // open document
    AddressPage.visit();
    Tree.openNode(['Ordner_3.Ebene_C']);
    UserAuthorizationPage.verifyDocumentTitle('Ordner_3.Ebene_C');
    Tree.deleteChildren('Ordner_3.Ebene_C', 1);
    // try to delete the folder: expect delete button to be disabled
    Tree.openNode(['Ordner_3.Ebene_C']);
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');
  });

  it('when "nur Unterordner" is activated, the overarching folder should not be able to be renamed (#2895)', () => {
    // set access right to "nur Unterordner"
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_Ebene_2C', 'Daten');
    AdminGroupPage.toolbarSaveGroup();
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
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3B']);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').click();
    cy.contains('mat-dialog-content mat-tree-node', rootFolder_1).should('not.exist');

    // II. Adressen
    const rootFolder_2 = 'Adressen';
    AddressPage.visit();
    // try to move
    Tree.openNode(['Ordner_2.Ebene_C', 'Ordner_3.Ebene_F']);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').click();
    cy.contains('mat-dialog-content mat-tree-node', rootFolder_2).should('not.exist');
  });

  it('when "nur Unterordner" is activated, the overarching folder should not be able to be relocated', () => {
    // set access right to "nur Unterordner"
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    UserAuthorizationPage.setButtonSubfoldersOnly('Ordner_Ebene_2C', 'Daten');
    AdminGroupPage.toolbarSaveGroup();
    // open document
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2C']);
    UserAuthorizationPage.verifyDocumentTitle('Ordner_Ebene_2C');
    // try to move via dialogue
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').should('be.disabled');
    // collapse the dialogue
    cy.get('[data-cy=toolbar_COPY]').click({ force: true });

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
    AdminUserPage.visit();
    cy.contains('button', 'Hinzufügen').click();
    AdminUserPage.addNewUserLogin('some_random_authorlogin');
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
    AdminUserPage.visit();
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
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup(groupName);
    AdminGroupPage.selectGroup(groupName2);
    cy.kcLogout();
  });

  xit('meta data admin should have the same access right to documents further down in the tree as the users to which the access rights were granted', () => {});

  it('meta data admin should be able to create groups', () => {
    const newGroup = 'some_new_group';
    const description = 'something of a description';

    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.addNewGroup(newGroup);
    AdminGroupPage.addGroupDescription(description);
    AdminGroupPage.toolbarSaveGroup();
    AdminGroupPage.verifyNewlyCreatedGroup(newGroup, description);
  });

  it('if a meta data admin deletes a document from one of his groups, he cannot access this document anymore (neither write nor read)', () => {
    // delete address from group and check existence
    AdminUserPage.visit();
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
    ResearchPage.checkNoSearchResults();
  });

  it('if metadata admin deletes one of his assigned groups, he should not be able to see the documents of this group', () => {
    // -1- create new document
    cy.kcLogout();
    cy.kcLogin('user');
    const documentName = 'newDocumentToDelete' + Utils.randomString();
    const newGroup = 'new_group_to_delete' + Utils.randomString();
    DocumentPage.visit();
    DocumentPage.createDocument(documentName);
    Tree.openNode([documentName]);
    // -2- create new group
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.addNewGroup(newGroup);
    // -3- assign folder to the group
    AdminGroupPage.addDocumentToGroup(documentName, 'Daten');
    AdminGroupPage.toolbarSaveGroup();
    // -4- assign group  to user
    AdminUserPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.selectUser('MetaAdmin mitGruppen');
    AdminUserPage.addGroupToUser(newGroup);
    AdminUserPage.toolbarSaveUser();
    cy.kcLogout();

    cy.kcLogin('meta2');
    // -5- delete the group
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.deleteGroup(newGroup);
    // -6- make sure the document is no longer exist
    DocumentPage.visit();
    cy.contains('mat-tree.mat-tree', documentName).should('not.exist');
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

  xit('metadata admin should not be able to see the users other metadata admins created', () => {
    AdminUserPage.visit();
    // create a new user
    cy.contains('button', 'Hinzufügen').click();
    AdminUserPage.addNewUserLogin('autor7');
    AdminUserPage.addNewUserFirstname('Autor_for_MD_test');
    AdminUserPage.addNewUserLastname('Test_autor');
    AdminUserPage.addNewUserEmail('testmd@wemove.com');
    AdminUserPage.addNewUserRole('Autor');
    AdminUserPage.confirmAddUserDialog();

    // log in as another metadata admin
    cy.kcLogout();
    cy.kcLogin('meta');

    // make sure user created by previous metadata admin is not visible
    AdminUserPage.visit();
    cy.contains('user-table', 'autor5').should('not.exist');
  });

  it('meta data admin should not be able to create a catalog administrator (#2875)', () => {
    // got to Users and Rights
    AdminUserPage.visit();
    // open dialog for creating new user and try to pick role "catalog administrator"
    cy.get('[data-cy="toolbar_add_user"]').click();
    cy.get('[data-cy="Rolle"]').click();
    // make sure option role = catalog administrator is not available
    cy.contains('.mat-option', 'Katalog-Administrator').should('not.exist');
  });

  it('meta data admin should not be able to access catalog management (#2874)', () => {
    AdminUserPage.visit();

    // check for catalog management in side bar
    cy.contains('ige-side-menu .mat-list-item', 'Katalog').should('not.exist');
    // check for catalog management in header menu
    cy.contains('.mat-menu-panel .mat-menu-item', 'Katalogverwaltung').should('not.exist');
    // check if url of catalog management is accessible illegally (not working)
    /*let link = 'catalog';
    cy.request(link, { failOnStatusCode: false }).then(response => {
      expect(response.status).not.to.eq(200);
    });*/
  });

  it('display of documents should be actualized accordingly after deletion action (#2786)', () => {
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3A']);
    // create document
    const docName = 'TestDokument' + Utils.randomString();
    DocumentPage.createDocument(docName);
    // go to research section and search for document
    ResearchPage.visit();
    ResearchPage.search(docName);
    ResearchPage.getSearchResultCount().should('equal', 1);
    cy.contains('td.mat-cell', docName).click();
    cy.contains('.label', docName);
    // delete the document
    DocumentPage.deleteLoadedNode();
    // search and expect to not get a result
    ResearchPage.visit();
    ResearchPage.search(docName);
    ResearchPage.checkNoSearchResults();
    // make sure display of documents has been actualized
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3A']);
    cy.contains('mat-tree-node', docName).should('not.exist');
  });
});

// catalogue admin
describe('Catalogue admin', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('eins');
  });

  // eigentlich egal, welcher User -> nur Recht, Gruppen Dokumente zuzuweisen nötig
  it('it should not be possible to add a piece of data twice to a group (#3461)', () => {
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    // it might be necessary to turn the page, if there are too many group entries to be displayed at once:
    AdminGroupPage.getNextPage();
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

  it('data that are part of different user-assigned groups are nevertheless only displayed once (#3471)', () => {
    const path_to_shared_folder = ['Neue Testdokumente', 'Ordner_Ebene_2C', 'Ordner_Ebene_3D'];
    const path_to_shared_address_folder = ['Ordner 2. Ebene', 'Ordner_3.Ebene_A', 'Ordner_4.Ebene_A'];
    // assign a user an additional group so that data overlap exists
    AdminUserPage.visit();
    AdminGroupPage.goToTabmenu(UserAndRights.User);
    cy.get('.page-title').contains('Nutzer');
    AdminUserPage.selectUser('Autor_mit Gruppen');
    AdminUserPage.addGroupToUser('test_gruppe_4');
    AdminGroupPage.toolbarSaveUser();
    // log in as the other user
    cy.kcLogout();
    cy.kcLogin('autor2');

    // make sure data documents are only listed once
    DocumentPage.visit();
    Tree.openNode(path_to_shared_folder);
    // check if folders in the path exist only once
    cy.get('mat-tree-node').filter(`:contains("${path_to_shared_folder[0]}")`).its('length').should('equal', 1);
    cy.get('mat-tree-node').filter(`:contains("${path_to_shared_folder[1]}")`).its('length').should('equal', 1);
    cy.get('mat-tree-node').filter(`:contains("${path_to_shared_folder[2]}")`).its('length').should('equal', 1);
    // check if document exists only once
    cy.contains('mat-tree-node.mat-tree-node', 'Datum_Ebene_4_7').its('length').should('equal', 1);
    cy.contains('mat-tree-node.mat-tree-node', 'Datum_Ebene_4_8').its('length').should('equal', 1);

    // make sure address documents are only listed once
    AddressPage.visit();
    Tree.openNode(path_to_shared_address_folder);
    // check if folders in the path exist only once
    cy.get('mat-tree-node').filter(`:contains("${path_to_shared_address_folder[0]}")`).its('length').should('equal', 1);
    cy.get('mat-tree-node').filter(`:contains("${path_to_shared_address_folder[1]}")`).its('length').should('equal', 1);
    cy.get('mat-tree-node').filter(`:contains("${path_to_shared_address_folder[2]}")`).its('length').should('equal', 1);
    // check if document exists only once
    cy.contains('mat-tree-node.mat-tree-node', 'Limousin, Adresse').its('length').should('equal', 1);
    cy.contains('mat-tree-node.mat-tree-node', 'Rheinland, Adresse').its('length').should('equal', 1);
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
    let organizationName = 'Organisation' + Utils.randomString();
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    cy.get('mat-dialog-container ige-breadcrumb').shouldHaveTrimmedText(`Adressen`);
    AddressPage.addOrganizationName(organizationName);
    cy.get('[data-cy=create-action]').click();
    DocumentPage.title = organizationName;
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
    AdminUserPage.visit();
    cy.get('mat-nav-list').find('.mat-list-item').should('contain', 'Nutzer & Rechte');
    AdminUserPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.getNumberOfUsers().should('be.greaterThan', 0);
    cy.intercept('/api/groups').as('loadingGroups');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.wait('@loadingGroups');
    AdminUserPage.getNumberOfGroups().should('be.greaterThan', 0);
  });

  it('catalogue admin can see empty groups', () => {
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('leere_Gruppe');
    cy.get('.user-title').contains('leere_Gruppe');
  });

  it('catalogue admin is warned when assigning groups different rights in the same hierarchy tree (#2764)', () => {
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('leere_Gruppe');
    cy.get('.user-title').contains('leere_Gruppe');
    AdminGroupPage.openAddDocumentsDialog('Daten');
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A', 'Ordner_Ebene_3B'], true);
    cy.get('mat-dialog-actions button').eq(1).click();
    AdminGroupPage.toolbarSaveGroup();

    // add folder higher up in the hierarchy
    AdminGroupPage.openAddDocumentsDialog('Daten');
    Tree.openNode(['Neue Testdokumente', 'Ordner_Ebene_2A'], true);
    cy.get('mat-dialog-actions button').eq(1).click();
    cy.contains('mat-dialog-container', 'Achtung! Überschreibt folgende Unterrechte:');
    // close warning box
    cy.get('mat-dialog-actions button').eq(2).click();
    // close box for adding documents
    cy.contains('mat-dialog-actions button', 'Abbrechen').click;
  });

  it('should show all the groups to a catalogue admin (#2670)', () => {
    // login as super admin
    // get number of the groups
    // logout from admin and login as catalog admin
    // get number of groups and compare the two numbers
    cy.kcLogout();
    cy.kcLogin('user');
    AdminUserPage.visit();
    cy.intercept('GET', '/api/groups').as('superAdminGroups');
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.wait('@superAdminGroups');
    cy.get('.page-title')
      .contains('Gruppen')
      .then($text => {
        // get number of the groups super admin
        let txt = $text.text();
        let regex = /\d+/g;
        let matches = txt.match(regex);
        cy.kcLogout();
        cy.kcLogin('eins');
        AdminUserPage.visit();
        cy.intercept('GET', '/api/groups').as('catalogAdminGroups');
        AdminGroupPage.goToTabmenu(UserAndRights.Group);
        cy.wait('@catalogAdminGroups');
        cy.get('.page-title')
          .contains('Gruppen')
          .then($txtCatalog => {
            // get number of the groups catalog admin
            let txtCatalog = $txtCatalog.text();
            let matchesCatalog = txtCatalog.match(regex);
            expect(matchesCatalog![0]).to.eq(matches![0]);
          });
      });
  });
});
