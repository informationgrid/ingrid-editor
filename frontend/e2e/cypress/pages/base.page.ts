export class BasePage {
  static type(dataId: string, text?: string) {
    if (text === undefined) {
      return;
    } else if (text === '') {
      cy.get(`[data-cy=${dataId}]`).clear();
    } else {
      cy.get(`[data-cy=${dataId}]`).type(text);
    }
  }
}
