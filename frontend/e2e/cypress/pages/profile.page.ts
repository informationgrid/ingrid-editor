export class ProfilePage {
  static visit() {
    cy.visit('profile');
    cy.get('ige-profile').contains('Persönliche Daten', { timeout: 9000 });
  }

  static loginUsingLoginPage(username: string, password: string) {
    cy.get('.title', { timeout: 20000 }).should('contain', 'InGrid');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#kc-login').click();
    cy.wait(1000);
  }

  static changeUserFirstLastName(firstName: string, lastName: string, submit: boolean = false) {
    cy.get('[data-cy="change-full-name-id"]').click();
    cy.get('ige-change-name-dialog').find('input').first().clear().type(firstName);
    cy.get('ige-change-name-dialog').find('input').eq(1).clear().type(lastName);
    if (submit) {
      cy.intercept('GET', 'api/info/currentUser').as('getUser');
      cy.get('ige-change-name-dialog').find('button').contains('Ändern').first().click();
      cy.wait('@getUser');
      cy.get('div .main-content').contains(firstName);
      cy.get('div .main-content').contains(lastName);
    }
  }

  static changeUserFirstName(firstName: string, submit: boolean = false) {
    cy.get('[data-cy="change-full-name-id"]').click();
    cy.get('ige-change-name-dialog').find('input').first().clear().type(firstName);
    if (submit) {
      cy.intercept('GET', 'api/info/currentUser').as('getUser');
      cy.get('ige-change-name-dialog').find('button').contains('Ändern').first().click();
      cy.wait('@getUser');
      cy.get('div .main-content').contains(firstName);
    }
  }

  static changeUserLastName(lastName: string, submit: boolean = false) {
    cy.get('[data-cy="change-full-name-id"]').click();
    cy.get('ige-change-name-dialog').find('input').eq(1).clear().type(lastName);
    if (submit) {
      cy.intercept('GET', 'api/info/currentUser').as('getUser');
      cy.get('ige-change-name-dialog').find('button').contains('Ändern').first().click();
      cy.wait('@getUser');
      cy.get('div .main-content').contains(lastName);
    }
  }
  static changeUserEmail(email: string, submit: boolean = false) {
    cy.get('[data-cy="change-email-id"]').click();
    cy.get('input[type="email"]').clear().type(email);
    if (submit) {
      cy.intercept('GET', 'api/info/currentUser').as('getUser');
      cy.get('button[type="submit"]').click();
      cy.wait('@getUser');
      cy.get('div .main-content').contains(email);
    }
  }

  static changePassword(username: string, oldPassword: string, newPassword: string) {
    cy.get('[data-cy="change-password-id"]').click();
    cy.get('[data-cy="confirm-dialog-resetPassword"]').click();
    // if the user has just logged in then no need to enter credentials
    // this.loginWithLoginPage(username, oldPassword);
    cy.get('#password-new').type(newPassword);
    cy.get('#password-confirm').type(newPassword);
    cy.get('#kc-login').click();
  }

  static checkUserInformation(
    firstName: string,
    lastName: string,
    userName: string,
    role: string,
    groups: string[] = []
  ) {
    cy.get('div.page-title').contains(firstName);
    cy.get('div.page-title').contains(lastName);
    cy.get('div.page-title').next().children().eq(1).contains(userName);
    cy.get('div.page-title').next().children().eq(3).contains(role);

    for (let i in groups) {
      cy.get('div.page-title').next().children().eq(5).children().contains(groups[i]);
    }
  }
}
