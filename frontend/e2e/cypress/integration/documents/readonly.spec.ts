import { DocumentPage } from '../../pages/document.page';
import { beforeEach } from 'mocha';
import { Utils } from '../../pages/utils';
import { AdminUserPage } from '../../pages/administration-user.page';
import { UserAndRights } from '../../pages/base.page';
import { AdminGroupPage } from '../../pages/administration-group.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';
import { Tree } from '../../pages/tree.partial';
import { CopyCutUtils } from '../../pages/copy-cut-utils';
import { AddressPage } from '../../pages/address.page';

describe('Read Only Documents', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('meta2-with-groups');
  });

  // tested in dashboard
  // it('should load a document from dashboard', () => {
  it('meta data admin with groups should not be able to edit/move/delete a data document of his assigned groups if access is read-only (#2778)', () => {
    let tempLocalFile = 'Doc_h';

    // try to edit document
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
    const readOnlyFolder = 'Folder_d';
    const folderToMove = 'Ordner_Ebene_3D';
    const documentToMove = 'Datum_Ebene_3_3';

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
    Tree.openNode(['Ordner_Ebene_2A', documentToMove]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    cy.contains('mat-dialog-content', 'Folder_for_meta2').should('not.exist');
    cy.get('[data-cy="dlg-close"]').click();

    // try to move this document via drag and drop to read-only folder
    CopyCutUtils.simpleDragdropWithoutAutoExpand(documentToMove, readOnlyFolder);
    AdminUserPage.attemptIllegitimateMove();
    // expect error
    cy.get('error-dialog').contains('keine Berechtigung');
  });

  it('should be able to copy a read only document #3512', function () {
    const readOnlyFolder = 'Folder_e';
    const documentToCopy = 'Doc_ee_1';

    // try to copy a document from the read-only folder to another folder
    DocumentPage.visit();
    Tree.openNode([readOnlyFolder, 'Folder_ee', documentToCopy]);
    cy.get('[data-cy=toolbar_COPY]').click();
    cy.get('[data-cy="copyMenu_COPY"]').click();
    Tree.openNodeInsideDialog(['Folder2 For Meta2']);
    Tree.confirmCopy();

    Tree.openNode(['Folder2 For Meta2', documentToCopy]);
  });

  it('should not be able to edit fields in read only document #3512', function () {
    // logout
    cy.kcLogout();

    // login as super admin
    cy.kcLogin('super-admin');

    const documentName = 'Doc_c_1';
    const groupName = 'group_for_meta2';

    AdminUserPage.visit();
    // assign the group to user meta2
    AdminUserPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.selectUser('MetaAdmin mitGruppen');
    AdminUserPage.addGroupToUser(groupName);
    AdminUserPage.saveUser();

    // logout from super user and login as meta2
    cy.kcLogout();
    cy.kcLogin('meta2-with-groups');
    DocumentPage.visit();
    // try to copy a document to the read-only folder
    Tree.openNode([documentName]);

    // if editing is forbidden, the first and second text areas should be disabled
    cy.get('textarea').eq(1).should('be.disabled');
    cy.get('textarea').eq(2).should('be.disabled');
  });
});
