import { AdminUserPage } from '../../pages/administration-user.page';

describe('Email-tests', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('user');
    AdminUserPage.visit();
    cy.get('.page-title').contains('Nutzer');

    cy.task('resetEmails');
  });

  it('should register a user, get her password per email and log in', () => {
    let userLogIn = 'email-test-' + Date.now().toString();
    let userEmail = 'email-test' + Date.now().toString() + '@wemove.com';
    var psw = '';

    // create user
    AdminUserPage.createNewUser(userLogIn, userEmail, 'Autor');

    AdminUserPage.extractAndResetNewUserPassword(userLogIn, userEmail, 'Autor');
  });
});
