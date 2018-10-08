import { FieldBase, IFieldBase } from './field-base';

export class CheckboxField extends FieldBase<string> {
  controlType = 'checkbox';

  constructor(options: IFieldBase<string>) {
    super(options);
    this.hideLabel = options['hideLabel'] || true;
  }
}

