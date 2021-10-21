import { DocumentPage, ROOT, SEPARATOR } from '../../pages/document.page';
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
    cy.kcLogin('meta2');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  // tested in dashboard
  // it('should load a document from dashboard', () => {
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
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_CUT"]').should('be.disabled');

    // try to delete
    cy.get(DocumentPage.Toolbar['Delete']).should('be.disabled');

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromReadToWrite('Ordner_Ebene_2C', 'Daten');
    AdminGroupPage.toolbarSaveGroup();
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
    cy.get('[data-cy="dlg-close"]').click();

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
    cy.get('[data-cy="dlg-close"]').click();

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
  it('should be able to copy a read only document #3512', function () {
    // TODO

    const readOnlyFolder = 'Ordner_Ebene_2C';
    const documentToCopy = 'Datum_Ebene_4_7';
    // set access to read-only
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(readOnlyFolder, 'Daten');
    AdminGroupPage.toolbarSaveGroup();

    DocumentPage.visit();
    // try to copy a document from the read-only folder to another folder
    Tree.openNode(['Ordner_Ebene_2C', 'Ordner_Ebene_3D', documentToCopy]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    Tree.openNode(['Ordner_Ebene_2A'], true);
    Tree.confirmCopy();

    Tree.openNode(['Ordner_Ebene_2A', documentToCopy], false);
    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromReadToWrite(readOnlyFolder, 'Daten');
    AdminGroupPage.toolbarSaveGroup();
  });

  it('should not be able to edit fields in read only document #3512', function () {
    const readOnlyFolder = 'Ordner_Ebene_2C';
    const documentName = 'Datum_Ebene_4_7';
    // set access to read-only
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(readOnlyFolder, 'Daten');
    AdminGroupPage.toolbarSaveGroup();

    DocumentPage.visit();
    // try to copy a document to the read-only folder
    Tree.openNode(['Ordner_Ebene_2C', 'Ordner_Ebene_3D', documentName]);

    // if editing is forbidden, the first and second text areas should be disabled
    cy.get('textarea').eq(1).should('be.disabled');
    cy.get('textarea').eq(2).should('be.disabled');

    // set access right back to 'write'
    cy.visit('user');
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup('test_gruppe_1');
    cy.get('.user-title').contains('test_gruppe_1');
    UserAuthorizationPage.changeAccessRightFromReadToWrite(readOnlyFolder, 'Daten');
    AdminGroupPage.toolbarSaveGroup();
  });
});
