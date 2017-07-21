
import {FieldBase} from './field-base';
import {CodelistEntry} from '../services/codelist.service';

export class DropdownField extends FieldBase<string> {
  controlType = 'dropdown';
  options: CodelistEntry[] = [];

  constructor(options: FieldBase<any> | {options?: any[]}) {
    super(options);
    this.options = options['options'] || [];
  }
}

