
import { FieldBase, IFieldBase } from './field-base';
import {CodelistEntry} from '../../store/codelist/codelist.model';

interface IDropDownFieldBase extends IFieldBase<string> {
  useCodelist?: number;
  options?: CodelistEntry[];
  isCombo?: boolean;
}

export class DropdownField extends FieldBase<string> {
  controlType = 'dropdown';
  useCodelist: number;
  options: CodelistEntry[] = [];
  isCombo: boolean;

  constructor(options: IDropDownFieldBase) {
    super(options);
    this.options = options['options'] || [];
    this.useCodelist = options['useCodelist'] || null;
    this.isCombo = options['isCombo'] || false;
  }
}

