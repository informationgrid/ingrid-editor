import { PartialGeneratorField } from '../+form/controls/field-partial-generator';
import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {FieldBase} from '../+form/controls/field-base';
import {Container} from '../+form/controls/container';

@Injectable()
export class FormControlService {
  constructor() {
  }

  toFormGroup(fields: FieldBase<any>[], data: any) {
    const group: any = {};
    fields.forEach( field => {
      if (field instanceof Container) {
        let result: any = null;
        if (field.isRepeatable) {
          const array: any[] = [];
          field.children.forEach(groups => {
            const subGroup = field.key ? {} : group;
            groups.forEach((child: any) => {
              subGroup[child.key] = this._addValidator(child, this.getDataValue(data, [child.key]));
            });
            array.push(new FormGroup(subGroup));
          });
          result = new FormArray(array);
        } else {
          const subGroup = field.key ? {} : group;
          field.children.forEach(child => {
            subGroup[child.key] = this._addValidator(child, this.getDataValue(data, [field.key, child.key]));
          });
          result = new FormGroup(subGroup);
        }
        if (field.key) {
          group[field.key] = result;
        }
      } else if (field.controlType === 'partialGenerator') {
        const g: any = [];
        if (data[field.key] !== undefined) {
          data[field.key].forEach((entry: any) => {
            const partialKey = Object.keys(entry)[0];
            const partial = (<PartialGeneratorField>field).partials.filter( (part: any) => part.key === partialKey )[0];
            g.push(this.toFormGroup([partial], entry));
          });
        }
        group[field.key] = new FormArray(g);
      } else {
        group[field.key] = this._addValidator( field, this.getDataValue(data, [field.key] ));
      }
    } );
    return new FormGroup( group );
  }

  getDataValue(data: any, keys: string[]): any {
    let obj: any = data;
    keys.some( key => {
      // for containers that do not want to bundle child fields -> skip
      if (!key) {
        return false;
      }

      obj = obj[key];
      if (obj === undefined) {
        return true;
      }
    });
    return obj;
  }

  _addValidator(field: any, value: any) {
    return field.validator ? new FormControl( value || '', field.validator ) :
      field.required ? new FormControl( value || '', Validators.required )
        : new FormControl( value || '' );
  }
}

