import {FieldBase} from './field-base';

export class CheckboxField extends FieldBase<string> {
  controlType = 'checkbox';
  // type: string;

  constructor(options: {} = {}) {
    super(options);
    // this.type = options['type'] || 'text';
  }
}

