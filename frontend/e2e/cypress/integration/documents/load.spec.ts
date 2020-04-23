describe('Load documents', () => {

  it('should load a document from dashboard', function () {
    cy.visit('/dashboard');
    cy.get('[data-cy=card-latest-docs] .mat-selection-list > :nth-child(1) .card-title').invoke('text').then( text => {
      cy.get('[data-cy=card-latest-docs] .mat-selection-list > :nth-child(1)').click();
      cy.url().should('include', '/form;id=');
      cy.get('.form-info-bar .title .label').should('have.text', text);
    });

  });
})
