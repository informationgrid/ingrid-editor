import { UserAndRights } from '../../pages/base.page';
import { AdminGroupPage, headerKeys } from '../../pages/administration-group.page';
import { AdminUserPage } from '../../pages/administration-user.page';
import { ResearchPage } from '../../pages/research.page';
import { Utils } from '../../pages/utils';
import { DocumentPage } from '../../pages/document.page';
import { UserAuthorizationPage } from '../../pages/user_authorizations.page';

describe('Group', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    AdminUserPage.visit();

    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');
  });

  it('should create a new group', () => {
    const newGroup = 'neue_Gruppe' + Utils.randomString();
    const description = 'Eine Beschreibung';

    AdminGroupPage.addNewGroup(newGroup);
    cy.get('groups-table').should('contain', newGroup);
    cy.get('textarea').clear().type(description);
    AdminGroupPage.saveGroup();

    cy.get('groups-table').should('contain', description);
  });

  it('should not be possible to give equal groupnames', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';

    AdminGroupPage.groupShouldExist(groupName);
    AdminGroupPage.addNewGroup(groupName);
    cy.get('error-dialog').contains('Es existiert bereits eine Gruppe mit diesem Namen');

    // close dialogs
    cy.get('button').contains('Schließen').click();
    cy.get('error-dialog').should('not.exist');
    cy.get('button').contains('Abbrechen').click();

    // check titles are unique
    AdminGroupPage.selectGroupAndWait(groupName2);
    AdminGroupPage.updateGroup({ name: groupName }, false);
    // clicking another field is needed to activate the error-message
    cy.get('textarea').click();

    cy.get('mat-error').should('have.length', 1);
    cy.get('mat-error').scrollIntoView().contains('Es gibt bereits eine Gruppe mit diesem Namen').should('be.visible');
    cy.get('[data-cy=toolbar_save_group]').should('be.disabled');
  });

  it('should be possible to modify groupname and description', () => {
    const groupName = 'test_gruppe_1';
    const modifiedGroupName = 'Foodgroup';
    const description = 'Eine Essensgruppe?';

    AdminGroupPage.selectGroupAndWait(groupName);

    // modify groupname, add description and save
    cy.get('#formRoles [formcontrolname=name]').clear().type(modifiedGroupName);
    cy.get('textarea').clear().type(description);
    AdminGroupPage.saveGroup();

    // check groupname has changed
    AdminGroupPage.groupShouldNotExist(groupName);
    AdminGroupPage.groupShouldExist(modifiedGroupName);

    // revert changes and check
    cy.get('#formRoles [formcontrolname=name]').clear().type(groupName);
    cy.get('textarea').clear();
    AdminGroupPage.saveGroup();

    AdminGroupPage.groupShouldNotExist(modifiedGroupName);
    AdminGroupPage.groupShouldExist(groupName);
  });

  it('should show discard dialog after changes and another group was selected', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';
    const description = 'Irgendeine Änderung';

    AdminGroupPage.selectGroupAndWait(groupName);

    cy.get('textarea').click().clear().type(description);

    AdminGroupPage.selectGroup(groupName2);
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    AdminUserPage.discardChanges();
  });

  it('should change a selected group after discard changes', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';
    const description = 'Irgendeine Änderung';

    // change something (name) and try to click on another user --> discard dialog appears
    AdminGroupPage.selectGroupAndWait(groupName);

    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.selectGroup(groupName2);
    AdminUserPage.discardChanges();

    cy.get('groups-table .selected').contains(groupName2);
    // check entry is not reverted to the previous value
    AdminGroupPage.selectGroupAndWait(groupName);
    cy.get('textarea').invoke('text').should('not.equal', description);
  });

  it('should not change a selected group after cancel changes (#2675)', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';
    const description = 'Noch eine Änderung';

    AdminGroupPage.selectGroupAndWait(groupName);
    // check group is selected
    cy.get('groups-table .selected').contains(groupName);

    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.selectGroup(groupName2);
    AdminUserPage.cancelChanges();
    AdminGroupPage.clearSearch();

    // selected group must be the same as before
    cy.get('groups-table .selected').contains(groupName);
  });

  it('should delete a group and all user connections must be deleted automatically', () => {
    const groupName = 'Gruppe zum Löschen' + Utils.randomString();
    const username = 'Katalog Admin1';

    AdminGroupPage.addNewGroup(groupName);

    // go to a user and connect the created group
    AdminGroupPage.goToTabmenu(UserAndRights.User);

    AdminUserPage.selectUser(username);
    AdminUserPage.addGroupToUser(groupName);
    AdminUserPage.saveUser();

    // go back to groups
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');

    AdminGroupPage.selectGroupAndWait(groupName);

    // delete the group which we connected
    cy.get('#formRoles [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content')
      .contains(`Möchten Sie die Gruppe "${groupName}" wirklich löschen? Die Gruppe wird von einem Benutzer verwendet:`)
      .should('be.visible');
    cy.get('[data-cy=confirm-dialog-confirm]').click();

    // check group is deleted
    cy.get('tbody').should('not.contain', groupName);

    // back to users and check connection is deleted
    AdminGroupPage.goToTabmenu(UserAndRights.User);

    AdminUserPage.selectUser(username);

    // check if group connection was deleted
    cy.get('[data-cy=groups]').should('not.contain', groupName);
  });

  it('should have save button be enabled, when group entries changed (#2569)', () => {
    const group = 'test_gruppe_1';
    const description = 'eine Beschreibung';

    AdminGroupPage.selectGroupAndWait(group);
    cy.get('[data-cy=toolbar_save_group]').should('be.disabled');

    cy.get('textarea').click().clear().type(description);
    cy.get('[data-cy=toolbar_save_group]').should('be.enabled');
  });

  it('should remove a document from a group as soon as deleting action is performed (#3469)', () => {
    // delete address from group
    AdminGroupPage.selectGroupAndWait('test_gruppe_2');
    AdminGroupPage.deleteDocumentFromGroup('Elsass, Adresse', 'Adressen');
    // make sure address is visually removed from group without prompt to affirm intention to delete document
    cy.get('mat-dialog-container').should('not.exist');
    cy.contains('permission-table tr', 'Elsass, Adresse').should('not.exist');
  });

  it('should be possible to jump between groups and associated users', () => {
    const group = 'group_11';
    const user = 'autor test';

    // add group to user
    AdminGroupPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.selectUser(user);
    AdminUserPage.addGroupToUser(group);
    AdminUserPage.saveUser();
    // jump from group to user
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(group);
    cy.contains('.user-title', group, { timeout: 10000 });
    AdminUserPage.selectAssociatedUser(user);
    // make sure group is associated to user
    cy.get('#formUser').should('be.visible');
    cy.get('ige-repeat-list').should('contain', group);
  });

  it('should show warning message when user try to delete a group that is assigned to other users', () => {
    let groupName = 'gruppe_mit_datenrechten';
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.deleteGroup(groupName, false);
    cy.get('mat-dialog-content').contains(
      `Möchten Sie die Gruppe "${groupName}" wirklich löschen? Die Gruppe wird von einem Benutzer verwendet`
    );
  });

  it('should show correct bread crumbs of documents in group view', () => {
    const groupName = 'group_10';
    const docName = 'Datum_Ebene_2_3';
    const docPath = 'Daten/Neue Testdokumente';
    AdminGroupPage.selectGroupAndWait(groupName);
    cy.contains('permission-table .mat-row', docName).within(_ => {
      cy.get('ige-breadcrumb').invoke('text').should('equal', docPath);
    });
  });

  it('should show correct information in group header', () => {
    /* 1. last-edited-date */
    // change an existing group and make sure the "last-edited" date is updated
    AdminGroupPage.selectGroupAndWait('leere_Gruppe');
    // edit group
    AdminGroupPage.addGroupDescription('Gruppe ohne irgendwelche Daten');
    AdminGroupPage.saveGroup();

    // check that last-edited date has been updated
    const dateOfToday = Utils.getFormattedDate(new Date());
    AdminGroupPage.verifyInfoInHeader(headerKeys.EditDate, dateOfToday);

    /* 2. ID */
    // make sure ID consists of a number
    AdminGroupPage.openUpGroupHeader();
    cy.contains(AdminGroupPage.ID, /[0-9]+/);

    /* 3. creation-date */
    // create group and make sure the created-date is correct
    const groupName = 'group' + Utils.randomString();
    AdminGroupPage.addNewGroup(groupName);
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.openUpGroupHeader();
    AdminGroupPage.verifyInfoInHeader(headerKeys.CreationDate, dateOfToday);
  });

  it('if metadata admin gets full access to document, he can immediately grant the same level of access himself (#3460)', () => {
    const documentName = 'exclusive_document';
    const group1 = 'gruppe_mit_ortsrechten'; // assigned group
    const group2 = 'gruppe_nur_Adressen'; // for admin visible group

    DocumentPage.CreateSimpleMcloudDocumentWithAPI(documentName, false, null);
    // add read access to document of an assigned group of meta data admin
    AdminGroupPage.selectGroupAndWait(group1);
    AdminGroupPage.addDocumentToGroup(documentName, 'Daten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(documentName, 'Daten');
    AdminGroupPage.saveGroup();
    // add read access for document to one of meta admin's groups (= those visible to him)
    AdminGroupPage.selectGroupAndWait(group2);
    AdminGroupPage.addDocumentToGroup(documentName, 'Daten');
    UserAuthorizationPage.changeAccessRightFromWriteToRead(documentName, 'Daten');
    AdminGroupPage.saveGroup();
    // make sure it's not possible for meta data admin to assign full access to document
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-with-groups');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(group2);
    // check that access right cannot be changed
    cy.get('[data-cy="Berechtigungen Daten"]')
      .contains(documentName)
      .parent()
      .parent()
      .within(() => {
        cy.get('[mattooltip="Schreibrecht"]').should('not.exist');
      });
    // change access right in meta data admin's assigned group
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    AdminUserPage.visit();
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(group1);
    UserAuthorizationPage.changeAccessRightFromReadToWrite(documentName, 'Daten');
    AdminGroupPage.saveGroup();
    // make sure access right can now be changed by meta data admin
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-with-groups');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroupAndWait(group2);
    UserAuthorizationPage.changeAccessRightFromReadToWrite(documentName, 'Daten');
  });

  it('when document is added to a meta data admins group without him having access to it, he can no longer see this group', () => {
    const groupName = 'leere_Gruppe';
    const documentName = 'inaccessible_document';

    DocumentPage.CreateSimpleMcloudDocumentWithAPI(documentName, false, null);
    // add document to empty group that belongs to metadata admin
    AdminGroupPage.selectGroupAndWait(groupName);
    AdminGroupPage.addDocumentToGroup(documentName, 'Daten');
    AdminGroupPage.saveGroup();
    // make sure meta data admin does not see group
    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-with-groups');
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
    cy.contains('groups-table tr', groupName).should('not.exist');
  });
});
