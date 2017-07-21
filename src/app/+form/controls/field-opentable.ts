import {FieldBase} from './field-base';

export class OpenTableField extends FieldBase<string> {
  controlType = 'opentable';
  columns: { editor: FieldBase<string>, formatter?: any }[];
  hideHeader: boolean;

  constructor(options: FieldBase<any> | {
    columns: { editor: FieldBase<string>, formatter?: any }[],
    hideHeader?: boolean
  }) {
    super(options);
    this.columns = options['columns'] || [];
    this.hideHeader = options['hideHeader'] || false;
  }
}

