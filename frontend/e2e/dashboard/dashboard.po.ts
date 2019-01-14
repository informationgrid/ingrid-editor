import { browser, element, by,  } from 'protractor';

export class DashboardPage {
  navigateTo() {
    return browser.get('#/dashboard');
  }

  getRecentDocsTitle() {
    return element(by.css('ige-root .recentDocs')).getText();
  }

  getActions() {
    return element.all(by.css('ige-root .shortcut')).all(by.css('.item'));
  }
}
