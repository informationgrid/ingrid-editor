export class ProfilePage {
  static visit() {
    cy.intercept('GET', 'api/info/currentUser').as('getUser');
    cy.visit('profile');
    cy.wait('@getUser');
  }

  static checkUserInformation(
    firstName: string,
    lastName: string,
    userName: string,
    role: string,
    groups: string[] = []
  ) {
    cy.get('div.page-title').contains(firstName);
    cy.get('div.page-title').contains(lastName);
    cy.get('div.page-title').next().children().eq(1).contains(userName);

    cy.get('div.page-title').next().children().eq(3).contains(role);

    if (groups.length > 0) {
      for (let i in groups) {
        cy.get('div.page-title').next().children().eq(5).children().eq(Number(i)).contains(groups[i]);
      }
    }
  }
}
