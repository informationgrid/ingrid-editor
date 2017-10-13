import { FieldBase, IFieldBase } from './field-base';

// interface ITextFieldBase extends IFieldBase<string> {
  // type?: string;
// }

export class TreeField extends FieldBase<string> {
  controlType = 'tree';
  // type: string;

  constructor(options: IFieldBase<string>) {
    super(options);
    // this.type = options['type'] || 'text';
  }
}

