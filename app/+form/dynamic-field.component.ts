import {Component, Input} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {FieldBase} from "./controls/field-base";


@Component({
  selector: 'dyn-field',
  template: require('./dynamic-field.component.html')
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
