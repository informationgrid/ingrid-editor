import { BasePage } from './base.page';
import {DocumentPage} from "./document.page";

export class BehavioursPage extends BasePage {


  static checkPageContains(cssItem: string,wordlist: string[]) {
    wordlist.forEach(el => {
      cy.get(cssItem).contains(el);
    });
  }

  static checkElementContainsSomething(cssItem: string = '.content div.scrollable') {
    cy.get(cssItem).should('not.empty');
  }

  static saveCatalogSetting(){
    cy.get('button').contains('Speichern').click();
  }

  static setCatalogSetting(title: string, state: boolean){
    if (state){
      BehavioursPage.getSwitchState(title, !state)
      BehavioursPage.toggleCatalogSetting(title)
    } else {
      BehavioursPage.toggleCatalogSetting(title)
    }
  }

  private static getSwitchState(title: string, state: boolean){
    return BehavioursPage.getCatalogCheckbox(title).find('[aria-checked="' + state + '"]');
  }

  private static toggleCatalogSetting(title: string) {
    return BehavioursPage.getCatalogCheckbox(title).click();
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
}
