import {Component, Input, EventEmitter, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FieldBase} from './controls';


@Component({
  selector: 'dyn-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.css']
})
export class DynamicFieldComponent {
  @Input() field: FieldBase<any>;
  @Input() form: FormGroup;
  @Input() value: any;

  @Output() onAddSection = new EventEmitter<any>();

  /*get isValid() {
   return this.form.controls[this.field.key].valid;
   }*/

  showError(errors: any) {
    if (!errors) {
      return;
    }

    const allErrors: string[] = [];
    Object.keys(errors).forEach( (key: string) => {
      if (!errors[key].valid) {
        allErrors.push(errors[key].error);
      }
    });
    return allErrors.join('<br>');
  }

  addSection(data: any) {
    this.onAddSection.emit(data);
  }
}
