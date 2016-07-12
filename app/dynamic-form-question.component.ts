import { Component, Input } from '@angular/core';
import { FormGroup, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {NgClass} from '@angular/common';
import {FieldBase} from "./controls/field-base";


@Component({
  selector: 'df-question',
  template: require('./dynamic-form-question.component.html'),
  directives: [REACTIVE_FORM_DIRECTIVES, NgClass]
})
export class DynamicFormQuestionComponent {
  @Input() field: FieldBase<any>;
  @Input() form: FormGroup;
  @Input() value: string;

  get isValid() {
    debugger;
    return this.form.controls[this.field.key].valid;
  }
}
