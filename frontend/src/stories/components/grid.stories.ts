import {storiesOf} from '@storybook/angular';
import {FormFieldsModule} from '../../app/form-fields/form-fields.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';


storiesOf('Grid', module).add('empty', () => ({
  moduleMetadata: {
    imports: [
      FormFieldsModule,
      MatInputModule,
      MatFormFieldModule,
      BrowserAnimationsModule,
      FormFieldsModule, ReactiveFormsModule
    ]
  },
  template: `<div [formGroup]="form">
                <ige-ngx-datagrid [columns]="columns" [formControlName]="'table'"></ige-ngx-datagrid>
              </div>`,
  props: {
    form: new FormGroup({
      table: new FormArray([
        new FormGroup({
          name: new FormControl('xxx'),
          gender: new FormControl('m'),
          start: new FormControl(new Date()),
        })
      ])
    }),
    columns: [
      {label: 'Name', key: 'name'},
      {
        label: 'Geschlecht', key: 'gender', type: 'select', options: [
          {label: 'Male', value: 'm'},
          {label: 'Female', value: 'f'}
        ]
      },
      {label: 'Start', key: 'start', type: 'date'}
    ]
  }
}));
