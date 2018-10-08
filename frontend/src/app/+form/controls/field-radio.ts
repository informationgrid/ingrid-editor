import { FieldBase, IFieldBase } from './field-base';

interface IRadioFieldBase extends IFieldBase<string> {
  options: any[];
  vertical?: boolean;
}

export class RadioField extends FieldBase<string> {
  controlType = 'radio';
  options: any[];
  vertical: boolean;

  constructor(options: IRadioFieldBase) {
    super(options);
    this.options = options['options'] || [];
    this.vertical = options['vertical'] || false;
  }
}

