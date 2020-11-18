describe('Login', () => {

  xit('should show the login page to begin with', () => {
    // at the moment not possible, because we use another way to log in
    cy.kcLogin('user');
    cy.visit('');
    cy.get('mat-card-title').should('contain', 'Login');
    cy.get('[data-test=login]').should('contain', 'Login');
  });

});
