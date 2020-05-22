describe('Dashboard', function () {

  before(function () {
    cy.kcLogin('user');
    cy.visit('');
  });

  it('should be shown as initial page when visiting app', () => {
    cy.get('.welcome').should('contain.text', 'Guten Morgen');
    cy.url().should('include', '/dashboard');
  });

});
