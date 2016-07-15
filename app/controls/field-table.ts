import {FieldBase} from "./field-base";

export class TableField extends FieldBase<string> {
  controlType = 'table';

  constructor(options: {} = {}) {
    super(options);
  }
}

