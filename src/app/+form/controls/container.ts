import { FieldBase, IFieldBase } from './field-base';

export interface IContainerFieldBase extends IFieldBase<string> {
  children: any[];
  isRepeatable?: false;
  useGroupKey?: string;
}

export class Container extends FieldBase<string> {
  controlType = 'container';
  isRepeatable = false;
  children: any[];
  useGroupKey: string;

  constructor(options: IContainerFieldBase) {
    super(options);
    this.children = options['children'] || [];
    this.useGroupKey = options['useGroupKey'] || null;
    this.isRepeatable = options['isRepeatable'] || false;
  }
}
