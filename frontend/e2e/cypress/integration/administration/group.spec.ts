import { BasePage, UserAndRights } from '../../pages/base.page';
import { AdminGroupPage } from '../../pages/administration-group.page';
import { AdminUserPage } from '../../pages/administration-user.page';

describe('Group', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');

    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('should create a new group', () => {
    const newGroup = 'neue Gruppe';
    const description = 'Eine Beschreibung';

    AdminGroupPage.addNewGroup(newGroup);
    cy.get('groups-table').should('contain', newGroup);
    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.toolbarSaveGroup();

    cy.get('groups-table').should('contain', description);
  });

  it('should not be possible to give equal groupnames', () => {
    const groupName = 'Marvel';
    const groupName2 = 'Gruppe 42';

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
    const groupName = 'Testgruppe';
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
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
    const description = 'Irgendeine Änderung';

    AdminGroupPage.selectGroup(groupName);

    cy.get('textarea').click().clear().type(description);

    cy.get('groups-table').contains(groupName2).click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
  });

  it('should change a selected group after discard changes', () => {
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
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
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
    const description = 'Noch eine Änderung';

    AdminGroupPage.selectGroup(groupName);
    // check group is selected
    cy.get('groups-table .selected').contains(groupName);

    cy.get('textarea').click().clear().type(description);
    cy.get('groups-table').contains(groupName2).click();
    AdminUserPage.cancelChanges();

    // selected group must be the same as before
    cy.get('groups-table .selected').contains(groupName);
  });

  it('should delete a group and all user connections must be deleted automatically', () => {
    const groupName = 'to Delete';
    const username = 'Meins Deins';

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
});
