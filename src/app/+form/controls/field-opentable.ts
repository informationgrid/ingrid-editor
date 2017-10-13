import { FieldBase, IFieldBase } from './field-base';

interface ITableFieldBase extends IFieldBase<string> {
  columns: { width?: string, editor: FieldBase<string>, formatter?: any }[],
  hideHeader?: boolean,
  addWithDialog?: boolean;
}

export class OpenTableField extends FieldBase<string> {
  controlType = 'opentable';
  columns: { width?: string, editor: FieldBase<string>, formatter?: any }[];
  hideHeader: boolean;
  addWithDialog: boolean;

  constructor(options: ITableFieldBase) {
    super(options);
    this.columns = options['columns'] || [];
    this.hideHeader = options['hideHeader'] || false;
    this.addWithDialog = options['addWithDialog'] || false;
  }
}

