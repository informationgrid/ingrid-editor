import {FieldBase} from './field-base';

export class OpenTableField extends FieldBase<string> {
  controlType = 'opentable';
  columns: FieldBase<string>[];

  constructor(options: {
    key: string,
    columns: FieldBase<string>[],
    label?: string,
    order?: number,
    domClass?: string
  }) {
    super(options);
    this.columns = options['columns'] || [];
  }
}

