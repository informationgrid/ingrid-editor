import {FieldBase} from './field-base';

export class MapField extends FieldBase<string> {
  controlType = 'map';
  settings: any;
  options: any;
  tileDef: any;
  height: number;

  constructor(options: {} = {}) {
    super(options);
    this.settings = options['settings'] || {};
    this.options = options['options'] || {};
    this.tileDef = options['tileDef'] || {};
    this.height = +options['height'] || 100;
  }
}

