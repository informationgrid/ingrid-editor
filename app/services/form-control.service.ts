import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {FieldBase} from '../+form/controls/field-base';
import {Container} from '../+form/controls/container';

@Injectable()
export class FormControlService {
  constructor() {
  }

  toFormGroup(fields: FieldBase<any>[], data: any) {
    let group: any = {};
    fields.forEach( field => {
      if (field instanceof Container) {
        let result: any = null;
        if (field.isRepeatable) {
          let array: any[] = [];
          field.children.forEach(groups => {
            let subGroup = field.key ? {} : group;
            groups.forEach((child: any) => {
              subGroup[child.key] = this._addValidator(child, this.getDataValue(data, [child.key]));
            });
            array.push(new FormGroup(subGroup));
          });
          result = new FormArray(array);
        } else {
          let subGroup = field.key ? {} : group;
          field.children.forEach(child => {
            //if (question.isRepeatable) {
            //  subGroup[0][child.key] = this._addValidator( child );
            //} else {
            subGroup[child.key] = this._addValidator(child, this.getDataValue(data, [field.key, child.key]));
            //}
          });
          result = new FormGroup(subGroup);
        }
        if (field.key) {
          group[field.key] = result;
        }
      } else if (field.controlType === 'partialGenerator') {
        let g: any = [];
        if (data[field.key] !== undefined) {
          data[field.key].forEach((entry: any) => {
            let partialKey = Object.keys(entry)[0];
            let partial = field.partials.filter( (part: any) => part.key === partialKey )[0];
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
      obj = obj[key];
      if (obj === undefined) return true;
    });
    return obj;
  }

  _addValidator(field: any, value: any) {
    return field.validator ? new FormControl( value || '', field.validator ) :
      field.required ? new FormControl( value || '', Validators.required )
        : new FormControl( value || '' );
  }
}

