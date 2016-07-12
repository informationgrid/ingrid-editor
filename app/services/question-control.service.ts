import { Injectable }   from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {FieldBase} from "../controls/field-base";
import {Container} from "../controls/container";

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: FieldBase<any>[] ) {
    let group: any = {};

    questions.forEach(question => {
      if (question instanceof Container) {
        question.children.forEach(child => {
          group[child.key] = this._addValidator(child);
        })
      } else {
        group[question.key] = this._addValidator(question);
      }
    });
    return new FormGroup(group);
  }

  _addValidator(field) {
    return field.validator ? new FormControl( field.value || '', field.validator ) :
      field.required ? new FormControl( field.value || '', Validators.required )
        : new FormControl( field.value || '' );
  }
}

