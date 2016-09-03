import {FieldBase} from './field-base';

export class RadioField extends FieldBase<string> {
  controlType = 'radio';
  options: any[];
  vertical: boolean;

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
    this.vertical = options['vertical'] || false;
  }
}

