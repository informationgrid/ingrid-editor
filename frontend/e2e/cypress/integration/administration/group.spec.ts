import { BasePage, UserAndRights } from '../../pages/base.page';
import { AdminPage } from '../../pages/administration.page';

describe('Group', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
    AdminPage.goToTabmenu(UserAndRights.Group);
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('create a group', () => {
    const newGroup = 'neue Gruppe';

    cy.get('.page-title').contains('Gruppen');
    AdminPage.addNewGroup(newGroup);
    cy.get('groups-table').should('contain', newGroup);
  });

  it('should not be possible to have same groupnames', () => {
    const groupName = 'Gruppe 42';

    cy.get('.page-title').contains('Gruppen');
    cy.get('groups-table').should('contain', groupName);
    AdminPage.addNewGroup(groupName);
    cy.get('error-dialog').contains('Fehler');
  });

  it('should be possible to modify groupname and description', () => {
    const groupName = 'Testgruppe';
    const modifiedGroupName = 'Foodgroup';
    const description = 'Eine Essensgruppe?';

    cy.get('.page-title').contains('Gruppen');
    cy.get('groups-table').contains(groupName).click();

    cy.get('#formRoles').should('be.visible');

    // modify groupname, add description and save
    cy.get('#formRoles mat-form-field input').click().clear().type(modifiedGroupName);
    cy.get('textarea').click().clear().type(description);
    AdminPage.toolbarSaveUser();

    // check groupname has changed
    cy.get('groups-table').should('not.contain', groupName);
    cy.get('groups-table').should('contain', modifiedGroupName);

    // revert changes and check
    cy.get('#formRoles mat-form-field input').click().clear().type(groupName);
    cy.get('textarea').click().clear();
    AdminPage.toolbarSaveUser();
    cy.get('groups-table').should('not.contain', modifiedGroupName);
    cy.get('groups-table').should('contain', groupName);
  });

  it('discard dialog must be appear, when changes on groups were not saved', () => {
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
    const description = 'Irgendeine Änderung';

    cy.get('.page-title').contains('Gruppen');
    cy.get('groups-table').contains(groupName).click();

    cy.get('#formRoles').should('be.visible');
    cy.get('textarea').click().clear().type(description);

    cy.get('groups-table').contains(groupName2).click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');
  });

  it('decline discard dialog do not reject all group changes', () => {
    const groupName = 'Testgruppe';
    const groupName2 = 'Gruppe 42';
    const description = 'Irgendeine Änderung';

    // change something (name) and try to click on anthother user --> discard dialog appears
    cy.get('.page-title').contains('Gruppen');
    cy.get('groups-table').contains(groupName).click();
    cy.get('#formRoles').should('be.visible');
    cy.get('textarea').click().clear().type(description);
    cy.get('groups-table').contains(groupName2).click();
    cy.get('mat-dialog-container').contains('Änderungen verwerfen').should('be.visible');

    // reject dialog --> the changes must be the same and it must be possible to save
    cy.get('[data-cy=confirm-dialog-discard]').click();

    // check entry is not changed to the inputted value before
    cy.get('textarea').invoke('text').should('not.equal', description);
    cy.get('[data-cy=toolbar_save_user]').should('be.enabled');
  });

  it('delete a group and all user connections must be deleted automatically', () => {
    const groupName = 'removable';

    cy.get('.page-title').contains('Gruppen');

    // create a new group, later it will be deleted
    AdminPage.addNewGroup(groupName);
    cy.get('groups-table').contains(groupName).click();

    // go to a user and connect the created group
    AdminPage.goToTabmenu(UserAndRights.User);
    cy.get('.page-title').contains('Nutzer');
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');
    AdminPage.selectUserGroupConnection(groupName);
    cy.intercept('GET', '/api/users/ige2').as('completeEditingRequest');
    AdminPage.toolbarSaveUser();
    // wait for the request that reports back the actualized data so that the editing procedure is completed
    cy.wait('@completeEditingRequest');

    // go back to groups
    AdminPage.goToTabmenu(UserAndRights.Group);
    cy.get('.page-title').contains('Gruppen');
    cy.get('groups-table').contains(groupName).click();
    cy.get('#formRoles').should('be.visible');

    // delete the group which we conncected
    cy.get('#formRoles [data-mat-icon-name=Mehr]').click();
    cy.get('button').contains('Löschen').click();
    cy.get('mat-dialog-content')
      .contains('Gruppe wirklich löschen? Die Gruppe wird von 1 Nutzer(n) verwendet:')
      .should('be.visible');
    cy.get('[data-cy=confirm-dialog-confirm]').click();

    // check group is deleted
    cy.get('tbody').should('not.contain', groupName);

    // back to users and check connection is deleted
    AdminPage.goToTabmenu(UserAndRights.User);
    cy.get('.page-title').contains('Nutzer');
    cy.get('tbody').contains('Majid Ercan').click();
    cy.get('#formUser').should('be.visible');

    // check if group connection was deleted
    cy.get('[data-cy=Gruppen]').should('not.contain', groupName);
  });
});
