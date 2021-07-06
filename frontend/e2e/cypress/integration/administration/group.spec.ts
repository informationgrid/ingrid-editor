import { BasePage, UserAndRights } from '../../pages/base.page';
import { AdminPage } from '../../pages/administration.page';

describe('User', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  xit('create a group', () => {
    AdminPage.goToTabmenu(UserAndRights.Group);
  });

  xit('should be possible to modiefy groupname and description', () => {});

  xit('discard dialog must be appear, when changes on groups were not saved', () => {});

  xit('decline discard dialog do not reject all group changes', () => {
    // change something (name) and try to click on anthother user --> discard dialog appears
    // reject dialog --> the changes must be the same and it must be possible to save
  });

  xit('delete a group and all user conncetions must be deleted automatically', () => {
    // when a group is connected with a user, a dialog must be open, when it will be deleted --> check dialog appears
  });

  xit('', () => {});
});
