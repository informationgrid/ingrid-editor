import { NotificationPage } from '../../pages/notification.page';
import { DashboardPage } from '../../pages/dashboard.page';

describe('Catalog management', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    NotificationPage.visit();
  });

  it('Catalog-admin should be able to create a notification for all users.', () => {
    let message = 'Welcome from test catalog';
    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(message);
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
