import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {FieldBase} from '../+form/controls/field-base';
import {Container} from '../+form/controls/container';

@Injectable()
export class FormControlService {
  constructor() {
  }

  toFormGroup(fields: FieldBase<any>[]) {
    let group: any = {};
    fields.forEach( field => {
      if (field instanceof Container) {
        let result: any = null;
        if (field.isRepeatable) {
          let array: any[] = [];
          field.children.forEach(groups => {
            let subGroup = field.key ? {} : group;
            groups.forEach((child: any) => {
              subGroup[child.key] = this._addValidator(child);
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
            subGroup[child.key] = this._addValidator(child);
            //}
          });
          result = new FormGroup(subGroup);
        }
        if (field.key) {
          group[field.key] = result;
        }
      } else if (field.controlType === 'partialGenerator') {
        let g: any = [];//new FormGroup({});
        group[field.key] = new FormArray(g);
      } else {
        group[field.key] = this._addValidator( field );
      }
    } );
    return new FormGroup( group );
  }

  _addValidator(field: any) {
    return field.validator ? new FormControl( field.value || '', field.validator ) :
      field.required ? new FormControl( field.value || '', Validators.required )
        : new FormControl( field.value || '' );
  }
}

