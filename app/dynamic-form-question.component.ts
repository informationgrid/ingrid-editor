import { Component, Input } from '@angular/core';
import { FormGroup, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {NgClass} from '@angular/common';

import { QuestionBase }     from './controls/question-base';

@Component({
  selector: 'df-question',
  templateUrl: 'app/dynamic-form-question.component.html',
  directives: [REACTIVE_FORM_DIRECTIVES, NgClass]
})
export class DynamicFormQuestionComponent {
  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;
  @Input() value: string;

  get isValid() {
    debugger;
    return this.form.controls[this.question.key].valid;
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/