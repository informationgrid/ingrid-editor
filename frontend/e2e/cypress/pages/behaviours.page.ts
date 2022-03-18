import { BasePage, CatalogsTabmenu } from './base.page';
import { DocumentPage } from './document.page';
import { Menu } from './menu';

export class BehavioursPage extends BasePage {
  static checkPageContains(cssItem: string, wordlist: string[]) {
    wordlist.forEach(el => {
      cy.get(cssItem).contains(el);
    });
  }

  static saveCatalogSetting() {
    cy.get('button').contains('Speichern').click();
  }

  static openCatalogSettingsTab(tabmenu: CatalogsTabmenu) {
    Menu.switchTo('CATALOG');
    // use a longer timeout since element is currently animating error could occur
    cy.wait(500);
    cy.get('ige-catalog-settings a.mat-tab-link:nth-child(' + tabmenu + ')', { timeout: 10000 }).click();
  }

  private static toggleCatalogSetting(title: string): void {
    BehavioursPage.getCatalogCheckbox(title).click();
  }

  private static getCatalogCheckbox(title: string) {
    return cy.get('mat-card').find('mat-card-title').contains(title).parent().parent().find('mat-slide-toggle');
  }

  static setCatalogInputbox(title: string, input: string) {
    BehavioursPage.getCatalogCheckbox(title).find('[aria-checked="true"]');
    return cy
      .get('mat-card')
      .find('mat-card-title')
      .contains(title)
      .parent()
      .parent()
      .parent()
      .find('mat-card-content')
      .clear()
      .type(input);
  }

  static checkTimeoutIs(timeout: string) {
    cy.get('ige-session-timeout-info').contains(timeout);
  }

  static setCatalogSetting(settingTitle: string, desiredState: boolean, save = true): void {
    const toggleNeeded = BehavioursPage.getCatalogCheckbox(settingTitle).find('[aria-checked="' + !desiredState + '"]');

    if (toggleNeeded) this.toggleCatalogSetting(settingTitle);

    if (save) this.saveCatalogSetting();
  }

  static setCatalogSettingInput(settingTitle: string, input: string) {
    this.setCatalogSetting(settingTitle, true, false);
    this.setCatalogInputbox(settingTitle, input);
    this.saveCatalogSetting();
  }
}
