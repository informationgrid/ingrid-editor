import { DocumentPage } from '../../pages/document.page';
import { beforeEach } from 'mocha';
import { Utils } from '../../pages/utils';
import { AdminUserPage } from '../../pages/administration-user.page';
import { UserAndRights } from '../../pages/base.page';
import { AdminGroupPage } from '../../pages/administration-group.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';
import { Tree } from '../../pages/tree.partial';
import { CopyCutUtils } from '../../pages/copy-cut-utils';

describe('Read Only Documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('meta2');
  });

  // tested in dashboard
  // it('should load a document from dashboard', () => {
  it('meta data admin with groups should not be able to edit/move/delete a data document of his assigned groups if access is read-only (#2778)', () => {
    let tempLocalFile = 'tempLocalFile' + Utils.randomString();
    let groupName = 'gruppe_mit_ortsrechten';

    // create new document
    cy.kcLogout();
    cy.kcLogin('user');
    DocumentPage.visit();
    DocumentPage.createDocument(tempLocalFile);
    AdminUserPage.visit();
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.addDocumentToGroup(tempLocalFile, 'Daten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(tempLocalFile, 'Daten');
    AdminGroupPage.saveGroup();
    cy.kcLogout();

    // try to edit
    cy.kcLogin('meta2');
    DocumentPage.visit();
    Tree.openNode([tempLocalFile]);
    // if editing is forbidden, the form fields are disabled
    cy.get('mat-form-field.mat-form-field-disabled');

    // try to move
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').should('be.disabled');

    // try to delete
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');
  });

  it('meta data admin with groups should not be able to move a data document to a read-only folder', () => {
    const readOnlyFolder = 'Folder_for_meta2' + Utils.randomString();
    const folderToMove = 'Ordner_Ebene_3D';
    const documentToMove = 'Datum_Ebene_4_1';

    // create new folder
    cy.kcLogout();
    cy.kcLogin('user');
    DocumentPage.visit();
    DocumentPage.createFolder(readOnlyFolder);
    AdminUserPage.visit();
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_mit_ortsrechten');
    AdminGroupPage.addDocumentToGroup(readOnlyFolder, 'Daten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(readOnlyFolder, 'Daten');
    AdminGroupPage.saveGroup();

    // login as meta2
    cy.kcLogout();
    cy.kcLogin('meta2');

    // try to move a folder to the read-only folder
    DocumentPage.visit();
    Tree.openNode(['Ordner_Ebene_2C', folderToMove]);
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
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3A', documentToMove]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    cy.contains('mat-dialog-content', 'Folder_for_meta2').should('not.exist');
    cy.get('[data-cy="dlg-close"]').click();

    // try to move this document via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(documentToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
    UserAuthorizationPage.closeErrorBox();
  });

  it('should be able to copy a read only document #3512', function () {
    const readOnlyFolder = 'Ordner_Ebene_2A';
    const documentToCopy = 'Datum_Ebene_4_1';
    // set access to read-only
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_nur_daten');
    cy.get('.user-title').contains('gruppe_nur_daten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(readOnlyFolder, 'Daten');
    AdminGroupPage.saveGroup();

    DocumentPage.visit();
    // try to copy a document from the read-only folder to another folder
    Tree.openNode(['Ordner_Ebene_2A', 'Ordner_Ebene_3A', documentToCopy]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    Tree.openNode(['Ordner_Ebene_2A'], true);
    Tree.confirmCopy();

    Tree.openNode(['Ordner_Ebene_2A', documentToCopy], false);
    // set access right back to 'write'
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('gruppe_nur_daten');
    cy.get('.user-title').contains('gruppe_nur_daten');
    UserAuthorizationPage.changeAccessRightFromReadToWrite(readOnlyFolder, 'Daten');
    AdminGroupPage.saveGroup();
  });

  it('should not be able to edit fields in read only document #3512', function () {
    // logout
    cy.kcLogout();

    // login as super admin
    cy.kcLogin('user');

    // create a folder
    // create a document inside the folder
    const documentName = 'document-for-meta2' + Utils.randomString();
    const groupName = 'group-for-meta2' + Utils.randomString();
    const parentFolder = 'folder-for-meta2' + Utils.randomString();

    // go to groups create  a group
    // add the document group
    // assign the group to user
    DocumentPage.visit();
    DocumentPage.createFolder(parentFolder);
    Tree.openNode([parentFolder]);
    DocumentPage.createDocument(documentName);

    // set access to read-only
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.addNewGroup(groupName);
    AdminGroupPage.addNestedDocumentToGroup([parentFolder, documentName], 'Daten');
    cy.get('.user-title').contains(groupName);
    UserAuthorizationPage.changeAccessRightFromWriteToRead(documentName, 'Daten');
    AdminGroupPage.saveGroup();

    // assign the group to user meta2
    AdminUserPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.selectUser('MetaAdmin mitGruppen');
    AdminUserPage.addGroupToUser(groupName);
    AdminUserPage.saveUser();

    // logout from super user and login as meta2
    cy.kcLogout();
    cy.kcLogin('meta2');
    DocumentPage.visit();
    // try to copy a document to the read-only folder
    Tree.openNode([documentName]);

    // if editing is forbidden, the first and second text areas should be disabled
    cy.get('textarea').eq(1).should('be.disabled');
    cy.get('textarea').eq(2).should('be.disabled');
  });
});
