import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {FieldBase} from '../+form/controls/field-base';
import {Container} from '../+form/controls/container';

@Injectable()
export class FormControlService {
  constructor() {
  }

  toFormGroup(questions: FieldBase<any>[]) {
    let group: any = {};
    questions.forEach( question => {
      if (question instanceof Container) {
        let result = null;

        if (question.isRepeatable) {
          let array = [];
          question.children.forEach(groups => {
            let subGroup = question.useGroupKey ? {} : group;
            groups.forEach(child => {
              subGroup[child.key] = this._addValidator(child);
            });
            array.push(new FormGroup(subGroup));
          });
          result = new FormArray(array);
        } else {
          let subGroup = question.useGroupKey ? {} : group;
          question.children.forEach(child => {
            //if (question.isRepeatable) {
            //  subGroup[0][child.key] = this._addValidator( child );
            //} else {
            subGroup[child.key] = this._addValidator(child);
            //}
          });
          result = new FormGroup(subGroup);
        }
        if (question.useGroupKey) {
          group[question.useGroupKey] = result;
        }
      } else {
        group[question.key] = this._addValidator( question );
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

