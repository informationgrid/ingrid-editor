describe('User', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('user');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  xit('should create a new user', () => {
    // check "OK"-button not clickable, when not all mandatory fields are filled
    // all mandatory fields must be filled
  });

  xit('login entry are not shown at user list view', () => {
    // only name, email, role symbol and organisation are shown
  });

  xit('the correct role symbol are shown at user list view', () => {});

  xit('should be possible to rename user', () => {});

  xit('should not possible to empty a mandatory field and save', () => {});

  xit('discard dialog must be appear, when changes on users were not saved', () => {});

  xit('decline discard dialog do not reject all user changes', () => {
    // change something (name) and try to click on anthother user --> discard dialog appears
    // reject dialog --> the changes must be the same and it must be possible to save
  });

  xit('should not possible to have equal logins', () => {});

  xit('should not possible to change login or role after user is created', () => {});

  xit('organization name must be shown at user list view', () => {});

  xit('show login- and creation informations', () => {
    // check fields "Zuletzt eingeloggt", "Erstellt am", "Geändert am" and ID/login
    // compare the entry in ID/login with the Login- field, must be eqaul and not editable
  });

  xit('should be possible to delete a user', () => {});

  xit('only names, emails or organisations can be search results', () => {
    // login data will not shown as search result --> check!
  });

  xit('should be possible to add and remove a group (or different groups) to a user', () => {
    // a group must be created before --> better create one for the init-db
  });

  xit('should not possible to add a group twice to one user', () => {});

  //TODO: Verification emails for user!

  xit('', () => {});
});
