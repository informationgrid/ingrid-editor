import {Component, Input, OnInit}  from '@angular/core';
import {FormGroup, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';

import {DynamicFormQuestionComponent} from './dynamic-form-question.component';
import {QuestionControlService}       from './services/question-control.service';
import {FieldBase} from "./controls/field-base";

@Component( {
  selector: 'dynamic-form',
  template: require( './dynamic-form.component.html' ),
  directives: [DynamicFormQuestionComponent, REACTIVE_FORM_DIRECTIVES],
  providers: [QuestionControlService]
} )
export class DynamicFormComponent implements OnInit {

  @Input() fields: FieldBase<any>[] = [];
  form: FormGroup;
  payLoad = '';
  data = {};

  constructor(private qcs: QuestionControlService) {
  }

  ngOnInit() {
    this.form = this.qcs.toFormGroup( this.fields );
  }

  onSubmit() {
    this.payLoad = JSON.stringify( this.form.value );
  }

  load() {
    this.data = {
      taskId: "1234567",
      title: "Meine erste UVP",
      description: "Hier ist eine Beschreibung."
    };
  }
}


/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */