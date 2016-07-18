export class FieldBase<T>{
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  validator: any;
  domClass: string;
  padding: boolean;

  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      required?: boolean,
      order?: number,
      controlType?: string,
      domClass?: string,
      padding?: boolean,
      validator?: any
    } = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.padding = options.padding || null;
    this.validator = options.validator || null;
    this.domClass = options.domClass || 'full';
  }
}
