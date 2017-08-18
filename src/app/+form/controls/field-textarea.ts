import {FieldBase, IFieldBase} from './field-base';

interface ITextAreaFieldBase extends IFieldBase<string> {
  rows?: number;
  type?: string;
}

export class TextareaField extends FieldBase<string> {
  controlType = 'textarea';
  type: string;
  rows: number;

  constructor(options: ITextAreaFieldBase) {
    super(options);
    this.type = options['type'] || '';
    this.rows = options['rows'] || 3;
  }
}

