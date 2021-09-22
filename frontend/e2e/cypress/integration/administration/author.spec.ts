describe('User', () => {
  beforeEach(() => {
    cy.kcLogin('autor2');
    cy.visit('dashboard');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('Section "Nutzer und Rechte" should not be visible to an author', () => {
    cy.get('mat-nav-list').find('.mat-list-item').should('not.contain', 'Nutzer & Rechte');
  });
});
