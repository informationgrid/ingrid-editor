import {FieldBase} from './field-base';

export class OpenTableField extends FieldBase<string> {
  controlType = 'opentable';
  columns: { editor: FieldBase<string>, formatter?: any }[];

  constructor(options: {
    key: string,
    columns: { editor: FieldBase<string>, formatter?: any }[],
    label?: string,
    order?: number,
    domClass?: string
  }) {
    super(options);
    this.columns = options['columns'] || [];
  }
}

