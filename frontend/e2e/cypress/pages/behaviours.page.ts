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

  static setCatalogSetting(title: string, shallBeActivated: boolean){
    cy.get(DocumentPage.Sidemenu.Katalogverwaltung).click();
    cy.get(BehavioursPage.CatalogsTabmenu.Katalogverhalten).click();
    BehavioursPage.toggleCatalogSetting(title, shallBeActivated);
  }

  private static toggleCatalogSetting(title: string, shallBeActivated: boolean) {
    const isActive = BehavioursPage.getCatalogCheckbox(title).find('[aria-checked="' + !shallBeActivated + '"]');

    if (shallBeActivated && isActive){
      return BehavioursPage.getCatalogCheckbox(title).click();
    } else if (!shallBeActivated && isActive){
      return BehavioursPage.getCatalogCheckbox(title).click();
    }
  }

  private static getCatalogCheckbox(title: string){
    return cy.get('mat-card').find('mat-card-title').contains(title).parent().parent().find('mat-slide-toggle');
  }

  static setCatalogInputbox(title: string, input: string){
    BehavioursPage.getCatalogCheckbox(title).find('[aria-checked="true"]');
    return cy.get('mat-card').find('mat-card-title').contains(title).parent().parent().parent().find('mat-card-content').clear().type(input);
  }
  static checkTimeoutIs(timeout: string){
    cy.get('ige-session-timeout-info').contains(timeout);
  }

  static setAndSaveCatalogSettings(catalogTitle: string, shallBeActivated: boolean){
    this.setCatalogSetting(catalogTitle, shallBeActivated);
    BehavioursPage.saveCatalogSetting();
  };

  static setInputAndSaveCatalogSettings(title:string, input:string){
    BehavioursPage.setCatalogSetting(title, true);
    BehavioursPage.setCatalogInputbox(title,input);
    BehavioursPage.saveCatalogSetting();
  }

  static turnOffCatalogSettingAndSave (title: string){
    BehavioursPage.setCatalogSetting(title, false);
    BehavioursPage.saveCatalogSetting();
  }
}
