
import {FieldBase} from './field-base';
import {CodelistEntry} from '../services/codelist.service';

export class DropdownField extends FieldBase<string> {
  controlType = 'dropdown';
  options: CodelistEntry[] = [];

  constructor(options: {
    key: string,
    label: string,
    options: CodelistEntry[]
  }) {
    super(options);
    this.options = options['options'] || [];
  }
}

