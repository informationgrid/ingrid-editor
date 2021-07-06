import { BasePage, UserAndRights } from './base.page';

export class AdminPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('mat-tab-header .mat-tab-label:nth-child(' + tabmenu + '', { timeout: 10000 }).click();
  }
}
