import {FieldBase} from "./field-base";

export class Container extends FieldBase<string> {
  controlType = 'container';
  children: any[];
  useGroupKey: string;

  constructor(options: {} = {}) {
    super(options);
    this.children = options['children'] || [];
    this.useGroupKey = options['useGroupKey'] || null;
  }
}

