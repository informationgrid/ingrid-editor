
import {FieldBase} from './field-base';
import {CodelistEntry} from '../services/codelist.service';

export class DropdownField extends FieldBase<string> {
  controlType = 'dropdown';
  useCodelist: number;
  options: CodelistEntry[] = [];
  isCombo: boolean;

  constructor(options: FieldBase<any> | {options?: any[], useCodelist?: number, isCombo?: boolean}) {
    super(options);
    this.options = options['options'] || [];
    this.useCodelist = options['useCodelist'] || null;
    this.isCombo = options['isCombo'] || false;
  }
}

