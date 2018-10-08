import { FieldBase, IFieldBase } from './field-base';

interface ITextFieldBase extends IFieldBase<string> {
  type?: string;
}

export class TextboxField extends FieldBase<string> {
  controlType = 'textbox';
  type: string;

  constructor(options: ITextFieldBase) {
    super(options);
    this.type = options['type'] || 'text';
  }
}

