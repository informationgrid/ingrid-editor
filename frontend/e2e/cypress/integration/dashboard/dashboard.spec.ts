describe('Dashboard', function () {

  it('should be shown as initial page when visiting app', function () {
    cy.visit('');
    cy.get('.welcome').should('contain.text', 'Guten Morgen');
    cy.url().should('include', '/dashboard');
  });

});
