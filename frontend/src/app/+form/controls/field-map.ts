import { FieldBase, IFieldBase } from './field-base';

interface IMapFieldBase extends IFieldBase<string> {
  settings: any;
  options: any;
  height: number;
}

export class MapField extends FieldBase<string> {
  controlType = 'map';
  settings: any;
  options: any;
  height: number;

  constructor(options: IMapFieldBase) {
    super(options);
    this.settings = options['settings'] || {};
    this.options = options['options'] || {};
    this.height = +options['height'] || 100;
  }
}

