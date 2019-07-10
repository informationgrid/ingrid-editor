import {storiesOf} from '@storybook/angular';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';

import {Welcome, Button} from '@storybook/angular/demo';
import {DateboxComponent} from '../app/form-fields/datebox/datebox.component';
import {MatCardModule, MatDatepickerModule, MatInputModule} from '@angular/material';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormFieldsModule} from '../app/form-fields/form-fields.module';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {OneColumnWrapperComponent} from '../app/formly/wrapper/one-column-wrapper.component';
import {IgeFormModule} from '../app/+form/ige-form.module';

storiesOf('Welcome', module).add('to Storybook', () => ({
  component: Welcome,
  props: {}
}));

storiesOf('Button', module)
  .add('with text', () => ({
    component: Button,
    props: {
      text: 'Hello Button'
    }
  }))
  .add(
    'with some emoji',
    () => ({
      component: Button,
      props: {
        text: '😀 😎 👍 💯'
      }
    }),
    {notes: 'My notes on a button with emojis'}
  )
  .add(
    'with some emoji and action',
    () => ({
      component: Button,
      props: {
        text: '😀 😎 👍 💯',
        onClick: action('This was clicked OMG')
      }
    }),
    {notes: 'My notes on a button with emojis'}
  );

storiesOf('Another Button', module).add('button with link to another story', () => ({
  component: Button,
  props: {
    text: 'Go to Welcome Story',
    onClick: linkTo('Welcome')
  }
}));
storiesOf('Datebox', module).add('simple', () => ({
  component: DateboxComponent,
  moduleMetadata: {
    imports: [
      CommonModule,
      FormsModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      FormFieldsModule
    ]
  },
  template: '<div [formGroup]="form"><ige-datebox [formControlName]="key"></ige-datebox></div>',
  props: {
    /*text: 'Go to Welcome Story',
    onClick: linkTo('Welcome'),*/
    key: 'birthday',
    form: new FormGroup({
      birthday: new FormControl(1562620600475)
    })

  }
}));
storiesOf('Formly', module).add('input', () => ({
  // component: ,
  moduleMetadata: {
    imports: [
      ReactiveFormsModule,
      IgeFormModule,
      BrowserAnimationsModule,
      MatCardModule,
      FormlyMaterialModule,
      FormlyModule.forRoot({
        wrappers: [
          { name: 'panel', component: OneColumnWrapperComponent },
        ],
      })
    ],
    declarations: [OneColumnWrapperComponent]
  },

  template: `<form [formGroup]="form">
                <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
            </form>
            {{model | json}} {{form.valid}}`,
  props: {
    model: {},
    form: new FormGroup({}),
    fields: <FormlyFieldConfig[]>[{
      key: 'ip',
      type: 'input',
      wrappers: ['panel', 'form-field'],
      templateOptions: {
        label: 'IP address',
        placeholder: 'Enter IP',
        required: true,
      },
      validators: {
        ip: {
          expression: (c) => /(\d{1,3}\.){3}\d{1,3}/.test(c.value),
          message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" is not a valid IP Address`,
        },
      },
    }]

  }
}));
