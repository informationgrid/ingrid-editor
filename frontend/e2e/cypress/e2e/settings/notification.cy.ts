import { NotificationPage } from '../../pages/notification.page';
import { DashboardPage } from '../../pages/dashboard.page';

describe('Catalog management', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('super-admin').as('tokens');
    NotificationPage.visit();
  });

  it('Should add a general notification, without expire date and check it in the dashboard #4328', () => {
    let message = 'Welcome from super admin';
    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(message);
    NotificationPage.toggleForGeneralNotification();
    NotificationPage.addNotification();

    // logout and check from message display in other users
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(message);

    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-without-groups');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(message);

    cy.logoutClearCookies();
    cy.kcLogin('mcloud-author-with-group');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(message);

    cy.logoutClearCookies();
    cy.kcLogin('uvpcatalog');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(message);
  });
});
