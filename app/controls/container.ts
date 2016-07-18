import {FieldBase} from "./field-base";

export class Container extends FieldBase<string> {
  controlType = 'container';
  children: any[];
  useGroupKey: string;

  constructor(options: {
    domClass?: string,
    children?: any[],
    useGroupKey?: string
  } = {}) {
    super(options);
    this.children = options['children'] || [];
    this.useGroupKey = options['useGroupKey'] || null;
  }
}

