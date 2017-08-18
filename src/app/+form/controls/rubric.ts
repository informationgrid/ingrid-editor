import { Container, IContainerFieldBase } from './container';

export class Rubric extends Container {
  controlType = 'rubric';
  label: string;
  domClass = 'full';
  hideLabel = true;

  constructor(options: IContainerFieldBase) {
    super(options);
    this.label = options['label'] || '';
  }
}

