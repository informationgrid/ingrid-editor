describe('Login', () => {
  it('should show the login page to begin with', () => {
    cy.visit('');
    cy.get('#kc-login').should('contain', 'Login');
  });
});
