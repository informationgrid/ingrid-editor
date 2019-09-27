import {storiesOf} from '@storybook/angular';
import {FormFieldsModule} from '../../app/form-fields/form-fields.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

const imports = [
  FormFieldsModule,
  MatInputModule,
  MatFormFieldModule,
  BrowserAnimationsModule,
  FormFieldsModule, ReactiveFormsModule
];

storiesOf('Grid', module).add('empty', () => ({
  moduleMetadata: {
    imports
  },
  template: `<ige-ngx-datagrid [columns]="columns" [(ngModel)]="model"></ige-ngx-datagrid>`,
  props: {
    model: [],
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
})).add('one entry', () => ({
  moduleMetadata: {
    imports
  },
  template: `<ige-ngx-datagrid [columns]="columns" [(ngModel)]="model"></ige-ngx-datagrid>{{model | json}}`,
  props: {
    model: [
      {name: 'Herber', gender: {value: 'm'}, start: new Date()}
    ],
    columns: [
      {label: 'Name', key: 'name', type: 'text'},
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
