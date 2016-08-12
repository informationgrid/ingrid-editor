import {Component, Input} from '@angular/core';
import {FormGroup, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {NgClass} from '@angular/common';
import {FieldBase} from './controls/field-base';
import {CustomInput} from './table/table.component';
import {LeafletComponent} from './leaflet/leaflet.component';


@Component({
  selector: 'dyn-field',
  template: require('./dynamic-field.component.html'),
  directives: [REACTIVE_FORM_DIRECTIVES, NgClass, CustomInput, LeafletComponent]
})
export class DynamicFieldComponent {
  @Input() field: FieldBase<any>;
  @Input() form: FormGroup;
  @Input() value: any;
  @Input() parentKey: string = null;

  /*get isValid() {
    return this.form.controls[this.field.key].valid;
  }*/
}
