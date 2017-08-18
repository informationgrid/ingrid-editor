import { FieldBase, IFieldBase } from './field-base';

interface IPartialFieldBase extends IFieldBase<string> {
  partials: any[];
  targetKey: string;
  isRepeatable?: boolean;
  children: any[];
}

export class PartialGeneratorField extends FieldBase<string> {
  controlType = 'partialGenerator';
  partials: any[];
  targetKey: string;
  isRepeatable: boolean;
  children: any[];

  constructor(options: IPartialFieldBase) {
    super(options);
    this.partials = options['partials'] || [];
    this.targetKey = options['targetKey'] || 'targetKey-not-set';
    this.isRepeatable = options['isRepeatable'] || true;
    this.children = options['children'] || [];
  }
}

