import {FieldBase} from './field-base';

export interface TableColumn {
  field: string;
  headerName: string;
  editable?: boolean;
}

export class TableField extends FieldBase<string> {
  controlType = 'table';
  columns: TableColumn[];

  constructor(options: {
    key: string,
    columns: TableColumn[],
    label?: string,
    order?: number
  }) {
    super(options);
    this.columns = options['columns'] || [];
  }
}

