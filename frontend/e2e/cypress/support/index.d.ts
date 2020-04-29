declare namespace Cypress {
  interface Chainable {

    shouldHaveTrimmedText(value: string): Chainable<Element>;

    hasErrorDialog(content?: string): void;

    fieldIsValid(fieldClass: string): void;

    fieldIsInvalid(fieldClass: string, content?: string): void;

  }
}
