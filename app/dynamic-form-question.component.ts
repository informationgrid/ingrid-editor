import { Component, Input } from '@angular/core';
import { FormGroup, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {NgClass} from '@angular/common';
import {FieldBase} from "./controls/field-base";
import {CustomInput} from "./table/table.component";


@Component({
  selector: 'df-question',
  template: require('./dynamic-form-question.component.html'),
  directives: [REACTIVE_FORM_DIRECTIVES, NgClass, CustomInput]
})
export class DynamicFormQuestionComponent {
  @Input() field: FieldBase<any>;
  @Input() form: FormGroup;
  @Input() value: string;
  @Input() parentKey: string = null;

  get isValid() {
    return this.form.controls[this.field.key].valid;
  }
}
