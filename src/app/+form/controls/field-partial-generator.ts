import {FieldBase} from './field-base';

export class PartialGeneratorField extends FieldBase<string> {
  controlType = 'partialGenerator';
  partials: any[];
  targetKey: string;
  isRepeatable: boolean;
  children: any[];

  constructor(options: {} = {}) {
    super(options);
    this.partials = options['partials'] || [];
    this.targetKey = options['targetKey'] || 'targetKey-not-set';
    this.isRepeatable = options['isRepeatable'] || true;
    this.children = options['children'] || [];
  }
}

