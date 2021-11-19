import { UserAndRights } from '../../pages/base.page';
import { AdminGroupPage, headerKeys } from '../../pages/administration-group.page';
import { AdminUserPage } from '../../pages/administration-user.page';
import { ResearchPage } from '../../pages/research.page';

describe('Group', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
    AdminUserPage.visit();

    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');
  });

  it('should create a new group', () => {
    const newGroup = 'neue_Gruppe';
    const description = 'Eine Beschreibung';

    AdminGroupPage.addNewGroup(newGroup);
    cy.get('groups-table').should('contain', newGroup);
    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.toolbarSaveGroup();

    cy.get('groups-table').should('contain', description);
  });

  it('should not be possible to give equal groupnames', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';

    cy.get('groups-table').should('contain', groupName);
    AdminGroupPage.addNewGroup(groupName);
    cy.get('error-dialog').contains('Es existiert bereits eine Gruppe mit diesem Namen');

    // close dialogs
    cy.get('button').contains('Schließen').click();
    cy.get('error-dialog').should('not.exist');
    cy.get('button').contains('Abbrechen').click();

    // check titles are unique
    AdminGroupPage.selectGroup(groupName2);
    cy.get('[formcontrolname=name]').click().clear().type(groupName);
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
    cy.get('#formRoles mat-form-field input').click().clear().type(modifiedGroupName);
    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.toolbarSaveGroup();

    // check groupname has changed
    cy.get('groups-table').should('not.contain', groupName);
    cy.get('groups-table').should('contain', modifiedGroupName);

    // revert changes and check
    cy.get('#formRoles mat-form-field input').click().clear().type(groupName);
    cy.get('textarea').click().clear();
    AdminGroupPage.toolbarSaveGroup();
    cy.get('groups-table').should('not.contain', modifiedGroupName);
    cy.get('groups-table').should('contain', groupName);
  });

  it('should show discard dialog after changes and another group was selected', () => {
    const groupName = 'test_gruppe_1';
    const groupName2 = 'test_gruppe_2';
    const description = 'Irgendeine Änderung';

    AdminGroupPage.selectGroup(groupName);

    cy.get('textarea').click().clear().type(description);

    cy.get('groups-table').contains(groupName2).click();
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
    cy.get('groups-table').contains(groupName2).click();
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
    cy.get('groups-table').contains(groupName2).click();
    AdminUserPage.cancelChanges();

    cy.wait(500);
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
    AdminGroupPage.toolbarSaveUser();

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

  it('should be enable save button, when group entries changed (#2569)', () => {
    const group = 'test_gruppe_1';
    const description = 'eine Beschreibung';

    AdminGroupPage.selectGroup(group);
    cy.get('[data-cy=toolbar_save_group]').should('be.disabled');

    cy.get('textarea').click().clear().type(description);
    cy.get('[data-cy=toolbar_save_group]').should('be.enabled');
  });

  it('should delete a document from a group when deleting action is performed and the save button is pressed (#3469)', () => {
    // delete address from group
    AdminUserPage.visit();
    AdminUserPage.goToTabmenu(UserAndRights.Group);
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
    AdminGroupPage.toolbarSaveGroup();

    // Go to Research section and make sure search doesn't return removed document
    ResearchPage.visit();
    ResearchPage.search('Elsass, Adresse');
    ResearchPage.getSearchResultCountZeroIncluded().should('eq', 0);
  });

  it('should be possible to jump between groups and associated users', () => {
    const group = 'z_group';
    const user = 'autor test';
    // create a new group
    AdminGroupPage.addNewGroup(group);
    AdminGroupPage.getNextPage();
    cy.get('groups-table').should('contain', group);
    // add group to user
    AdminUserPage.visit();
    AdminUserPage.selectUser(user);
    AdminUserPage.addGroupToUser(group);
    AdminUserPage.toolbarSaveUser();
    // jump from group to user
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    AdminGroupPage.getNextPage();
    AdminGroupPage.selectGroup(group);
    AdminUserPage.selectAssociatedUser(user);
    // make sure group is associated to user
    cy.get('ige-repeat-list').should('contain', group);
  });

  it('should show correct information in group header', () => {
    // change an existing group and make sure the "last-edited" date is updated
    AdminGroupPage.selectGroup('leere_Gruppe');
    // edit group
    AdminGroupPage.addGroupDescription('Gruppe ohne irgendwelche Daten');
    AdminGroupPage.toolbarSaveGroup();
    // check that last-edited date has been updated
    const today = new Date();
    const formatted_date = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    AdminGroupPage.verifyInfoInHeader(headerKeys.EditDate, formatted_date);

    // make sure ID consists of a number
    AdminGroupPage.openUpGroupHeader();
    cy.contains(AdminGroupPage.ID, /[0-9]+/);
  });

  xit('should show to a user the  groups of the subusers of the user she represents (#2670)', () => {});
});
