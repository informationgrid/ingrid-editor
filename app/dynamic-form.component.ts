import { Component, Input, OnInit }  from '@angular/core';
import { FormGroup, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

import { DynamicFormQuestionComponent } from './dynamic-form-question.component';
import { QuestionBase }                 from './controls/question-base';
import { QuestionControlService }       from './services/question-control.service';

@Component({
  selector: 'dynamic-form',
  template: require('./dynamic-form.component.html'),
  directives: [DynamicFormQuestionComponent, REACTIVE_FORM_DIRECTIVES],
  providers:  [QuestionControlService]
})
export class DynamicFormComponent implements OnInit {

  @Input() questions: QuestionBase<any>[] = [];
  form: FormGroup;
  payLoad = '';
  data = { firstName: 'y', lastName: 'y'};

  constructor(private qcs: QuestionControlService) {  }

  ngOnInit() {
    this.form = this.qcs.toFormGroup(this.questions);
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }

  load() {
    this.data = {"firstName":"Andre", "lastName":"Wallat", "emailAddress":"test@test.com","brave":"solid"};
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/