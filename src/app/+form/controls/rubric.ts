import { FieldBase } from './field-base';
import { Container } from './container';

export class Rubric extends Container {
  controlType = 'rubric';
  label: string;
  domClass = 'full';
  hideLabel = true;

  constructor(options: Container | { controlType?: string } = {}) {
    super(options);
    this.label = options['label'] || '';
  }
}

