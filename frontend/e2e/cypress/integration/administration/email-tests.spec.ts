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
    let userLogIn = 'email-test';
    let userEmail = 'email-test@wemove.com';
    var psw = '';

    // create user
    cy.get('button', { timeout: 5000 }).contains('Hinzufügen').click();
    AdminUserPage.addNewUserLogin(userLogIn);
    AdminUserPage.addNewUserFirstname(userLogIn);
    AdminUserPage.addNewUserLastname(userLogIn);
    AdminUserPage.addNewUserEmail(userEmail);
    AdminUserPage.addNewUserRole('Autor');
    cy.get('button').contains('Anlegen').parent().should('not.have.class', 'mat-button-disabled');
    AdminUserPage.confirmAddUserDialog();

    // get email and extract the password
    cy.task('getLastEmail', userEmail)
      .its('body')
      .then(body => {
        expect(body).to.contain('Herzlich Willkommen beim IGE-NG');

        psw = body.substring(body.indexOf('Passwort: ') + 'Passwort: '.length, body.indexOf('(muss') - 1);

        cy.kcLogout();
        cy.get('.title', { timeout: 20000 }).should('contain', 'InGrid');

        cy.get('#username').type(userLogIn);
        cy.get('#password').type(psw);
        cy.get('#kc-login').click();

        cy.get('#kc-header-wrapper').should('contain', 'Update password');
      });
  });
});
