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
    AdminGroupPage.toolbarSaveUser();

    cy.get('groups-table').should('contain', description);
  });

  it('should not be possible to give equal groupnames', () => {
    const groupName = 'Marvel';

    cy.get('groups-table').should('contain', groupName);
    AdminGroupPage.addNewGroup(groupName);
    cy.get('error-dialog').contains('Es existiert bereits eine Gruppe mit diesem Namen');

    // TODO: groupnames are unique --> test it!
  });

  it('should be possible to modify groupname and description', () => {
    const groupName = 'Testgruppe';
    const modifiedGroupName = 'Foodgroup';
    const description = 'Eine Essensgruppe?';

    AdminGroupPage.selectGroup(groupName);

    // modify groupname, add description and save
    cy.get('#formRoles mat-form-field input').click().clear().type(modifiedGroupName);
    cy.get('textarea').click().clear().type(description);
    AdminGroupPage.toolbarSaveUser();

    // check groupname has changed
    cy.get('groups-table').should('not.contain', groupName);
    cy.get('groups-table').should('contain', modifiedGroupName);

    // revert changes and check
    cy.get('#formRoles mat-form-field input').click().clear().type(groupName);
    cy.get('textarea').click().clear();
    AdminGroupPage.toolbarSaveUser();
    cy.get('groups-table').should('not.contain', modifiedGroupName);
    cy.get('groups-table').should('contain', groupName);
  });

  it('discard dialog must be appear, when changes on groups were not saved', () => {
    // TODO: change title to make it clearer
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
    const description = 'Irgendeine Änderung';

    AdminGroupPage.selectGroup(groupName);

    cy.get('textarea').click().clear().type(description);

    cy.get('groups-table').contains(groupName2).click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
  });

  it('decline discard dialog do not reject all group changes', () => {
    // TODO: change title to make it clearer
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
    const description = 'Irgendeine Änderung';

    // change something (name) and try to click on anthother user --> discard dialog appears
    AdminGroupPage.selectGroup(groupName);

    cy.get('textarea').click().clear().type(description);
    cy.get('groups-table').contains(groupName2).click();
    AdminUserPage.discardChanges();

    // check entry is not reverted to the previous value
    // TODO: fix it
    cy.get('textarea').invoke('text').should('not.equal', description);
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
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
    cy.intercept('GET', '/api/users/ige2').as('completeEditingRequest');
    AdminGroupPage.toolbarSaveUser();

    // go back to groups
    AdminGroupPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');

    AdminGroupPage.selectGroup(groupName);

    // delete the group which we connected
    cy.get('#formRoles [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content')
      .contains('Gruppe wirklich löschen? Die Gruppe wird von 1 Nutzer(n) verwendet:')
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
