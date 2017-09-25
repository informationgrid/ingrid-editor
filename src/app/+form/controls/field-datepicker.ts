import { FieldBase, IFieldBase } from './field-base';

interface ITextFieldBase extends IFieldBase<string> {
  type?: string;
}

export class DatepickerField extends FieldBase<string> {
  controlType = 'datepicker';

  constructor(options: ITextFieldBase) {
    super(options);
  }
}

