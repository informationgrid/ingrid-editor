import { BasePage } from './base.page';
import {DocumentPage} from "./document.page";

export class BehavioursPage extends BasePage {


  static checkPageContains(cssItem: string,wordlist: string[]) {
    wordlist.forEach(el => {
      cy.get(cssItem).contains(el);
    });
  }

  static saveCatalogSetting(){
    cy.get('button').contains('Speichern').click();
  }

  static setCatalogSetting(title: string, switchStateTo: boolean){
    cy.get(DocumentPage.Sidemenu.Katalogverwaltung).click();
    cy.get(BehavioursPage.CatalogsTabmenu.Katalogverhalten).click();
    BehavioursPage.toggleCatalogSetting(title, switchStateTo);
  }

  private static getSwitchState(title: string, state: boolean){
    return BehavioursPage.getCatalogCheckbox(title).find('[aria-checked="' + state + '"]');
  }

  private static toggleCatalogSetting(title: string, switchStateTo: boolean) {
    if (switchStateTo){
      this.getSwitchState(title, false)
      return BehavioursPage.getCatalogCheckbox(title).click();
    } else if (!switchStateTo){
      this.getSwitchState(title, true)
      return BehavioursPage.getCatalogCheckbox(title).click();
    }
  }

  private static getCatalogCheckbox(title: string){
    return cy.get('mat-card').find('mat-card-title').contains(title).parent().parent().find('mat-slide-toggle');
  }

  static setCatalogInputbox(title: string, seconds: string){
    BehavioursPage.getSwitchState(title, true)
    return cy.get('mat-card').find('mat-card-title').contains(title).parent().parent().parent().find('mat-card-content').clear().type(seconds);
  }
  static checkTimeoutIs(timeout: string){
    cy.get('ige-session-timeout-info').contains(timeout);
  }

  static setAndSaveCatalogSettings(catalogTitle: string, switchStateTo: boolean){
    this.setCatalogSetting(catalogTitle, switchStateTo);
    BehavioursPage.saveCatalogSetting();
  };
}
