import { NotificationPage } from '../../pages/notification.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { Utils } from '../../pages/utils';

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

  it('Should add multiple general notifications with expire date, (old date, now and in the future), and check for the notifications in the dashboard for multiple users. #4328', () => {
    let messageOldDate = 'general notification old expire date ';
    let messageCurrentDate = 'general notification expire date today';
    let messageFutureDate = 'general notification future expire date ';
    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(messageOldDate);
    NotificationPage.setExpireDate('01.09.2022');
    NotificationPage.toggleForGeneralNotification();
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(messageOldDate);

    let currentDateString = Utils.getFormattedDate(new Date());
    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(messageCurrentDate);
    NotificationPage.setExpireDate(currentDateString);
    NotificationPage.toggleForGeneralNotification();
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(messageCurrentDate);

    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(messageFutureDate);
    NotificationPage.setExpireDate('01.09.2066');
    NotificationPage.toggleForGeneralNotification();
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(messageFutureDate);

    // check for super admin
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(messageOldDate, true);
    NotificationPage.checkForNotificationInDashboard(messageCurrentDate);
    NotificationPage.checkForNotificationInDashboard(messageFutureDate);

    // logout and check from message display in other users
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(messageOldDate, true);
    NotificationPage.checkForNotificationInDashboard(messageCurrentDate);
    NotificationPage.checkForNotificationInDashboard(messageFutureDate);

    cy.logoutClearCookies();
    cy.kcLogin('mcloud-meta-without-groups');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(messageOldDate, true);
    NotificationPage.checkForNotificationInDashboard(messageCurrentDate);
    NotificationPage.checkForNotificationInDashboard(messageFutureDate);

    cy.logoutClearCookies();
    cy.kcLogin('mcloud-author-with-group');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(messageOldDate, true);
    NotificationPage.checkForNotificationInDashboard(messageCurrentDate);
    NotificationPage.checkForNotificationInDashboard(messageFutureDate);

    cy.logoutClearCookies();
    cy.kcLogin('uvpcatalog');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(messageOldDate, true);
    NotificationPage.checkForNotificationInDashboard(messageCurrentDate);
    NotificationPage.checkForNotificationInDashboard(messageFutureDate);
  });

  it('Should add notifications (with and without expire date) for specific catalog, and check the existing of the notification in different catalog. #4328', () => {
    let catalogMessageWithDate = 'catalog notification with expire date ';
    let catalogMessageWithoutDate = 'catalog notification without expire date ';
    cy.logoutClearCookies();
    cy.kcLogin('test-catalog-general-test').as('tokens');
    NotificationPage.visit();

    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(catalogMessageWithDate);
    NotificationPage.setExpireDate('01.09.2066');
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(catalogMessageWithDate);

    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(catalogMessageWithoutDate);
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(catalogMessageWithoutDate);

    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithDate);
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithoutDate);

    // logout and check from message display in other users
    cy.logoutClearCookies();
    cy.kcLogin('super-admin');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithDate, true);
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithoutDate, true);

    cy.logoutClearCookies();
    cy.kcLogin('mcloud-author-with-group');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithDate, true);
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithoutDate, true);

    cy.logoutClearCookies();
    cy.kcLogin('uvpcatalog');
    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithDate, true);
    NotificationPage.checkForNotificationInDashboard(catalogMessageWithoutDate, true);
  });

  it('Should delete general and catalog notifications. #4328', () => {
    let generalMessage = 'general message to delete';
    let catalogMessage = 'catalog message to delete ';

    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(generalMessage);
    NotificationPage.toggleForGeneralNotification();
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(generalMessage);

    NotificationPage.openNotificationDialog();
    NotificationPage.addNotificationText(catalogMessage);
    NotificationPage.addNotification();
    NotificationPage.checkForNotificationInTable(catalogMessage);

    NotificationPage.deleteNotification(generalMessage);
    NotificationPage.checkForNotificationInTable(generalMessage, true);
    NotificationPage.deleteNotification(catalogMessage);
    NotificationPage.checkForNotificationInTable(catalogMessage, true);

    DashboardPage.visit();
    NotificationPage.checkForNotificationInDashboard(generalMessage, true);
    NotificationPage.checkForNotificationInDashboard(catalogMessage, true);
  });
});
