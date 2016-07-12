import {FieldBase} from "./field-base";

export class TextareaField extends FieldBase<string> {
  controlType = 'textarea';
  type: string;
  rows: number;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
    this.rows = options['rows'] || 3;
  }
}

