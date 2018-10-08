import { FieldBase, IFieldBase } from './field-base';

interface ILinkDatasetFieldBase extends IFieldBase<string> {
  filter?: any;
}

export class LinkDatasetField extends FieldBase<string> {
  controlType = 'linkDataset';
  filter: any = {};

  constructor(options: ILinkDatasetFieldBase) {
    super(options);
    this.filter = options['filter'] || {};
  }
}

