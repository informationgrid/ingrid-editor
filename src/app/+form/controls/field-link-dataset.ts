import {FieldBase} from './field-base';

export class LinkDatasetField extends FieldBase<string> {
  controlType = 'linkDataset';
  filter: any = {};

  constructor(options: {} = {}) {
    super(options);
    this.filter = options['filter'] || {};
  }
}

