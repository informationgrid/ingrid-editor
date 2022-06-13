export class NotificationPage {
  static visit() {
    cy.visit('settings/messages');
    cy.get('ige-messages-management').contains('Benachrichtigungen', { timeout: 9000 });
  }

  static openNotificationDialog() {
    cy.get('[data-cy=open-add-notification] button').click();
  }

  static addNotificationText(notificationText: string) {
    cy.get('mat-dialog-content textarea').type(notificationText);
  }

  static addNotification() {
    cy.intercept('POST', '/api/messages').as('incorrectAddNot');
    cy.get('[data-cy=create-notification]').click();
    cy.wait('@incorrectAddNot');
  }

  static checkForNotificationInDashboard(notificationText: string) {
    cy.get('.welcome .message').contains(notificationText);
  }
}
