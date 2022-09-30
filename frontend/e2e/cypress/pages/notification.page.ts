export class NotificationPage {
  static visit() {
    cy.visit('settings/messages');
    cy.get('ige-messages-management', { timeout: 9000 }).contains('Benachrichtigungen', { timeout: 9000 });
  }

  static openNotificationDialog() {
    cy.get('[data-cy=open-add-notification] button').click();
  }

  static addNotificationText(notificationText: string) {
    cy.get('mat-dialog-content textarea').type(notificationText);
  }

  static toggleForGeneralNotification() {
    cy.get('mat-slide-toggle input').check({ force: true });
  }

  static deleteNotification(notificationText: string) {
    cy.contains('td', notificationText).siblings().contains('button', 'delete').click();
    cy.get('mat-dialog-actions button').contains('Ok').click();
  }
  static addNotification() {
    cy.intercept('POST', '/api/messages').as('incorrectAddNot');
    cy.get('[data-cy=create-notification]').click();
    cy.wait('@incorrectAddNot');
  }

  static checkForNotificationInTable(notification: string, notContains: boolean = false) {
    if (notContains) {
      cy.get('ige-card-box').should('not.contain', notification);
    } else {
      cy.get('ige-card-box').should('contain', notification);
    }
  }

  static setExpireDate(date: string) {
    cy.get('.mat-datepicker-input').type(date);
  }
  static checkForNotificationInDashboard(notificationText: string, notContains: boolean = false) {
    if (notContains) {
      cy.get('.welcome ').should('not.contain', notificationText);
    } else {
      cy.get('.welcome ').should('contain', notificationText);
    }
  }
}
