export interface IFieldBase<T> {
  value?: T,
  key?: string,
  label?: string,
  required?: boolean,
  order?: number,
  controlType?: string,
  domClass?: string,
  padding?: boolean,
  validator?: any,
  hideLabel?: boolean,
  width?: string,
  help?: string
}

export class FieldBase<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  validator: any;
  domClass: string;
  padding: boolean;
  hideLabel: boolean;
  width: string;
  help: string;

  constructor(options: IFieldBase<T>) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.padding = options.padding || null;
    this.validator = options.validator || null;
    this.domClass = options.domClass || 'full';
    this.hideLabel = options.hideLabel || false;
    this.width = options.width || null;
    this.help = options.help || null;
  }
}
