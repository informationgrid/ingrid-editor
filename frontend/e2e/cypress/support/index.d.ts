declare namespace Cypress {
  type Position =
    | 'topLeft'
    | 'top'
    | 'topRight'
    | 'left'
    | 'center'
    | 'right'
    | 'bottomLeft'
    | 'bottom'
    | 'bottomRight';

  interface Chainable {
    shouldHaveTrimmedText(value: string): Chainable<Element>;

    hasErrorDialog(content?: string): void;

    fieldIsValid(fieldClass: string): void;

    fieldIsInvalid(fieldClass: string, content?: string): void;

    containsFormErrors(count: number): void;

    drag(value: string, options?: { position?: Position; force?: boolean }): Chainable<Element>;
  }
}
