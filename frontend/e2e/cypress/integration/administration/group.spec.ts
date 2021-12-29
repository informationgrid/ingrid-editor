import { UserAndRights } from '../../pages/base.page';
import { AdminGroupPage, headerKeys } from '../../pages/administration-group.page';
import { AdminUserPage } from '../../pages/administration-user.page';
import { ResearchPage } from '../../pages/research.page';
import { Utils } from '../../pages/utils';

describe('Group', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
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
    AdminGroupPage.selectGroup(groupName2);
    AdminGroupPage.updateGroup({ name: groupName }, false);
    // clicking another field is needed to activate the error-message
    cy.get('textarea').click();

    cy.get('mat-error').should('have.length', 1);
    cy.get('mat-error').contains('Es gibt bereits eine Gruppe mit diesem Namen').should('be.visible');
    cy.get('[data-cy=toolbar_save_group]').should('be.disabled');
  });

  it('should be possible to modify groupname and description', () => {
    const groupName = 'test_gruppe_1';
    const modifiedGroupName = 'Foodgroup';
    const description = 'Eine Essensgruppe?';

    AdminGroupPage.selectGroup(groupName);

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

    AdminGroupPage.selectGroup(groupName);

    cy.get('textarea').click().clear().type(description);

    AdminGroupPage.selectGroup(groupName2);
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
    // close error box
    cy.findByText('Verwerfen').click();
    // make sure error box is not there anymore
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('should change a selected group after discard changes', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';
    const description = 'Irgendeine Änderung';

    // change something (name) and try to click on another user --> discard dialog appears
    AdminGroupPage.selectGroup(groupName);

    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.selectGroup(groupName2);
    AdminUserPage.discardChanges();

    cy.get('groups-table .selected').contains(groupName2);
    // check entry is not reverted to the previous value
    AdminGroupPage.selectGroup(groupName);
    cy.get('textarea').invoke('text').should('not.equal', description);
  });

  it('should not change a selected group after cancel changes (#2675)', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';
    const description = 'Noch eine Änderung';

    AdminGroupPage.selectGroup(groupName);
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
    const groupName = 'neue_Gruppe';
    const username = 'Katalog Admin1';

    AdminGroupPage.selectGroup(groupName);

    // go to a user and connect the created group
    AdminGroupPage.goToTabmenu(UserAndRights.User);
    cy.get('.page-title').contains('Nutzer');

    AdminUserPage.selectUser(username);
    AdminUserPage.addGroupToUser(groupName);
    AdminUserPage.saveUser();

    // go back to groups
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');

    AdminGroupPage.selectGroup(groupName);

    // delete the group which we connected
    cy.get('#formRoles [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content')
      .contains('Möchten Sie die Gruppe wirklich löschen? Die Gruppe wird von einem Nutzer verwendet:')
      .should('be.visible');
    cy.get('[data-cy=confirm-dialog-confirm]').click();

    // check group is deleted
    cy.get('tbody').should('not.contain', groupName);

    // back to users and check connection is deleted
    AdminGroupPage.goToTabmenu(UserAndRights.User);
    cy.get('.page-title').contains('Nutzer');

    AdminUserPage.selectUser(username);

    // check if group connection was deleted
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
  });

  it('should have save button be enabled, when group entries changed (#2569)', () => {
    const group = 'test_gruppe_1';
    const description = 'eine Beschreibung';

    AdminGroupPage.selectGroup(group);
    cy.get('[data-cy=toolbar_save_group]').should('be.disabled');

    cy.get('textarea').click().clear().type(description);
    cy.get('[data-cy=toolbar_save_group]').should('be.enabled');
  });

  // FIXME: This test does not do what ticket #3469 describes
  xit('should delete a document from a group when deleting action is performed and the save button is pressed (#3469)', () => {
    // delete address from group
    AdminGroupPage.selectGroup('test_gruppe_2');
    AdminGroupPage.deleteDocumentFromGroup('Elsass, Adresse', 'Adressen');

    // try to switch to different group; because save button has not been pressed, the deletion has not taken place
    AdminGroupPage.selectGroup('leere_Gruppe');
    cy.contains('mat-dialog-content', 'Wollen Sie die Änderungen verwerfen?');
    cy.contains('button', 'Verwerfen').click();
    cy.contains('.label', 'leere_Gruppe');
    // go back to group and delete document, this time with pushing save button
    AdminGroupPage.selectGroup('test_gruppe_2');
    AdminGroupPage.deleteDocumentFromGroup('Elsass, Adresse', 'Adressen');
    AdminGroupPage.saveGroup();

    // Go to Research section and make sure search doesn't return removed document
    ResearchPage.visit();
    ResearchPage.search('Elsass, Adresse');
    ResearchPage.setDocumentTypeSearchFilter('Adressen');
    ResearchPage.checkNoSearchResults();
  });

  it('should be possible to jump between groups and associated users', () => {
    const group = 'z_group' + Utils.randomString();
    const user = 'autor test';
    const groupOther = 'test_gruppe_1';

    // create a new group
    AdminGroupPage.addNewGroup(group);

    // TODO: remove this when refresh of group is fixed, after a user is assigned the group which is already opened
    AdminGroupPage.selectGroup(groupOther);

    // add group to user
    AdminGroupPage.goToTabmenu(UserAndRights.User);
    AdminUserPage.selectUser(user);
    AdminUserPage.addGroupToUser(group);
    AdminUserPage.saveUser();
    // jump from group to user
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.selectGroup(group);
    cy.contains('.user-title', group, { timeout: 10000 });
    AdminUserPage.selectAssociatedUser(user);
    // make sure group is associated to user
    cy.get('#formUser').should('be.visible');
    cy.get('ige-repeat-list').should('contain', group);
  });

  it('should show correct information in group header', () => {
    /* 1. last-edited-date */
    // change an existing group and make sure the "last-edited" date is updated
    AdminGroupPage.selectGroup('leere_Gruppe');
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
    AdminGroupPage.selectGroup(groupName);
    AdminGroupPage.openUpGroupHeader();
    AdminGroupPage.verifyInfoInHeader(headerKeys.CreationDate, dateOfToday);
  });

  xit('should show to a user the  groups of the subusers of the user she represents (#2670)', () => {});
});
