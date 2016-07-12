import {FieldBase} from "./field-base";

export class Container extends FieldBase<string> {
  controlType = 'container';
  children = [];

  constructor(options: {} = {}) {
    super(options);
    this.children = options['children'] || [];
  }
}

