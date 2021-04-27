import { BasePage } from './base.page';
import {DocumentPage} from "./document.page";

export class BehavioursPage extends BasePage {


  static checkPageContains(cssItem: string,wordlist: string[]) {
    wordlist.forEach(el => {
      cy.get(cssItem).contains(el);
    });
  }

}
