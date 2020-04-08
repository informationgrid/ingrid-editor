/**
 * Login command
 */
Cypress.Commands.add("guiLogin", (username, password) => {
  //visit must be done before the log in
  cy.visit('');
  cy.get('input[formcontrolname="username"]').type(username);
  cy.get('input[formcontrolname="password"]').type(password);

  cy.get('[data-test=login]').click();
});

/**
 * Login Command
 */
Cypress.Commands.add("apiLogin", (user, psw) => {
  user = user ? user : 'admin';
  psw = psw ? psw : 'admin';
  cy.request({
    method: 'POST',
    url: 'rest/passport/login',
    body: {username: user, password: psw}
    // failOnStatusCode: false
  }).then((response) => {
    if (response.body !== 'User not found') {
      window.localStorage.setItem('currentUser', JSON.stringify(response.body))
    }
  });
  cy.visit('');
});

/**
 * Logout Command
 */
Cypress.Commands.add("guiLogout", () => {
  cy.get('[data-test=logout]').click();
});

/**
 * Logout Command
 */
Cypress.Commands.add("apiLogout", () => {
  cy.request({
    method: 'GET',
    url: 'rest/passport/logout'
  });
  cy.reload();
});

/**
 * change to configuration page
 */
Cypress.Commands.add("goToConfig", () => {
  cy.get('[data-test=menu-config]').click();
});

/**
 * change to harvester page
 */
Cypress.Commands.add("goToHarvester", () => {
  cy.get('[data-test=menu-harvester]').click();
});

/**
 * change to log page
 */
Cypress.Commands.add("goToLog", () => {
  cy.get('[data-test=menu-log]').click();
});

/**
 * press button for adding a new harvester
 */
Cypress.Commands.add("addNewHarvester", () => {
  cy.get('#btnAddHarvester').click();
});

/**
 * press button for opening an existing harvester with given ID and updates it
 */
Cypress.Commands.add("openHarvester", (harvesterId) => {
  cy.get('#harvester-' + harvesterId).click();
  // cy.get('#harvester-' + harvesterId).click();
  cy.get('#harvester-' + harvesterId + ' [data-test=edit]').click();
});

/**
 * press button for harvester update
 */
Cypress.Commands.add("saveHarvesterConfig", () => {
  cy.get('.mat-button').contains('Anlegen').click();
  cy.wait(500);
});

/**
 * press button to update an old harvester
 */
Cypress.Commands.add("updateHarvester",() => {
  cy.get('.mat-button').contains('Aktualisieren').click();
});

/**
 * open harvester and start import process
 * @param harvesterId
 */
Cypress.Commands.add("openAndImportHarvester", (harvesterId) => {
  cy.get('#harvester-' + harvesterId).click();
  cy.get('#harvester-' + harvesterId + ' [data-test=import]').click();
});

/**
 * open harvester and schedule page
 * @param harvesterId
 */
Cypress.Commands.add("openScheduleHarvester", (harvesterId) => {
  cy.get('#harvester-' + harvesterId).click();
  cy.get('#harvester-' + harvesterId + ' [data-test=schedule]').click();
});

/**
 * ONLY open log page of a harvester, an harvester should already be opened
 * @param harvesterId
 */
Cypress.Commands.add("openLog", (harvesterId) => {
  cy.get('#harvester-' + harvesterId + ' [data-test=log]', {timeout: 6000}).click();
});
