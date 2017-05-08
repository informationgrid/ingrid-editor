import {FieldBase} from './field-base';

export class Container extends FieldBase<string> {
  controlType = 'container';
  isRepeatable = false;
  children: any[];
  useGroupKey: string;

  constructor(options: {
    domClass?: string,
    isRepeatable?: boolean,
    children?: any[],
    useGroupKey?: string,
    label?: string,
    order?: number,
    key?: string
  } = {}) {
    super(options);
    this.children = options['children'] || [];
    this.useGroupKey = options['useGroupKey'] || null;
    this.isRepeatable = options['isRepeatable'] || false;
  }
}
