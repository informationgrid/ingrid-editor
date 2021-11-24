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

    //Here we want to wait after user creation to get the email
    //Because it takes some time to receive welcoming email
    //we are unable to intercept the call, so we added random wait about 5 seconds
    cy.wait(5000);
    // get email and extract the password
    cy.task('getLastEmail', userEmail)
      .its('body')
      .then(body => {
        expect(body).to.contain('Herzlich Willkommen beim IGE-NG');

        // Extract the password
        let bodyArray = body.split('Ihr Passwort für den IGE-NG lautet:');
        psw = bodyArray[1].split('\n')[0].trim();

        cy.kcLogout();
        // Here we have to reload otherwise the because logout does not redirect to login page
        cy.reload();
        cy.get('.title', { timeout: 20000 }).should('contain', 'InGrid');

        cy.get('#username').type(userLogIn);
        cy.get('#password').type(psw);
        cy.get('#kc-login').click();
        cy.wait(1000);
        cy.get('#kc-content-wrapper').should('contain', 'Sie müssen Ihr Passwort ändern,');

        // login and check for the user name
        cy.get('#password-new').type(userLogIn);
        cy.get('#password-confirm').type(userLogIn);
        cy.intercept('GET', 'api/info/currentUser').as('getUser');
        cy.get('#kc-login').click();
        cy.wait('@getUser');
        cy.get('.welcome').contains('Willkommen');
        cy.get('[data-cy="header-profile-button"]').click();
        cy.get('.mat-card-title').contains(userLogIn + ' ' + userLogIn);
      });
  });
});
