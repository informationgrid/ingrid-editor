describe('Login', () => {

  it('should show the login page to begin with', () => {
    cy.kcLogin('user');
    cy.visit('');
    cy.get('mat-card-title').should('contain', 'Login');
    cy.get('[data-test=login]').should('contain', 'Login');
  });

});
