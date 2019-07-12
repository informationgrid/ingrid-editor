import {storiesOf} from '@storybook/angular';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';

import {Button, Welcome} from '@storybook/angular/demo';
import {DateboxComponent} from '../app/form-fields/datebox/datebox.component';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {FormFieldsModule} from '../app/form-fields/form-fields.module';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {IgeFormlyModule} from '../app/formly/ige-formly.module';
import {FormlyModule} from '@ngx-formly/core';
import {OneColumnWrapperComponent} from '../app/formly/wrapper/one-column-wrapper.component';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AutocompleteTypeComponent} from '../app/formly/types/autocomplete-type.component';
import {MatAutocompleteModule, MatInputModule} from '@angular/material';
import {of} from 'rxjs';

let formlyTemplate = `<form [formGroup]="form" class="form-content">
                        <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
                      </form>`;

function IpValidator(control: FormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : {'ip': true};
}

let formlyModuleMetadata = {
  imports: [
    IgeFormlyModule,
    MatInputModule,
    MatAutocompleteModule,
    FlexLayoutModule,
    FormlyMaterialModule,
    FormlyModule.forRoot({
      wrappers: [
        {name: 'panel', component: OneColumnWrapperComponent}
      ],
      types: [{
        name: 'autocomplete',
        component: AutocompleteTypeComponent,
        wrappers: ['form-field']
      }],
      validators: [
        { name: 'ip', validation: IpValidator },
      ],
      validationMessages: [
        { name: 'ip', message: 'This is not a valid IP Address' }
      ]
    })
  ],
  declarations: [OneColumnWrapperComponent, AutocompleteTypeComponent]
};

const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
  'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

function filterStates(name: string) {
  return states.filter(state =>
    state.toLowerCase().indexOf(name.toLowerCase()) === 0);
}

storiesOf('Welcome', module).add('to Storybook', () => ({
  component: Welcome,
  props: {}
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


storiesOf('Formly', module).add('input with validation', () => ({
  moduleMetadata: formlyModuleMetadata,
  template: formlyTemplate,
  props: {
    model: {},
    form: new FormGroup({}),
    fields: <FormlyFieldConfig[]>[{
      key: 'ip',
      type: 'input',
      wrappers: ['panel', 'form-field'],
      templateOptions: {
        //label: 'IP address',
        externalLabel: 'IP address',
        placeholder: 'Enter IP',
        required: true,
        appearance: 'outline'
      },
      validators: {
        ip: {
          expression: (c) => /(\d{1,3}\.){3}\d{1,3}/.test(c.value),
          message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" is not a valid IP Address`
        }
      }
    }]
  }
}))
  .add('input with async validation', () => ({
    moduleMetadata: formlyModuleMetadata,
    template: formlyTemplate,
    props: {
      model: {},
      form: new FormGroup({}),
      fields: <FormlyFieldConfig[]>[
        {
          key: "email",
          type: "input",
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: "Email"
          },
          asyncValidators: {
            uniqueEmail: {
              expression: (control: FormControl) => {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve(control.value && control.value.indexOf('@') !== -1);
                  }, 1000);
                });
              },
              message: 'This is not an email address.'
            }
          }
        }
      ]
    }
  }))
  .add('input with validation pre-defined', () => ({
    moduleMetadata: formlyModuleMetadata,
    template: formlyTemplate,
    props: {
      model: {},
      form: new FormGroup({}),
      fields: <FormlyFieldConfig[]>[
        {
          key: "ip",
          type: "input",
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: "IP"
          },
          validators: {
            validation: ['ip']
          }
        }
      ]
    }
  }))
  .add('selectbox', () => ({
    moduleMetadata: formlyModuleMetadata,
    template: formlyTemplate,
    props: {
      model: {},
      form: new FormGroup({}),
      fields: <FormlyFieldConfig[]>[
        {
          key: "gender",
          type: "select",
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: "Gender",
            placeholder: 'Please choose',
            appearance: 'outline',
            options: [
              {label: 'male', value: 'm'},
              {label: 'female', value: 'f'}
            ]
          }
        }
      ]
    }
  }))
  .add('combobox', () => ({
    moduleMetadata: formlyModuleMetadata,
    template: formlyTemplate,
    props: {
      model: {},
      form: new FormGroup({}),
      fields: <FormlyFieldConfig[]>[
        {
          key: "gender",
          type: "autocomplete",
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: "Gender",
            placeholder: 'Please choose',
            appearance: 'outline',
            filter: (term) => of(term ? filterStates(term) : states.slice())
          }
        }
      ]
    }
  }))
  .add('checkbox and show extra input', () => ({
    moduleMetadata: formlyModuleMetadata,
    template: formlyTemplate,
    props: {
      model: {},
      form: new FormGroup({}),
      fields: <FormlyFieldConfig[]>[
        {
          key: "active",
          type: "checkbox",
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: "Is Active"
          }
        },
        {
          key: 'howActive',
          type: 'input',
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: 'How active?',
            appearance: 'outline'
          },
          hideExpression: '!model.active'
        }
      ]
    }
  }))
  .add('checkbox and change required state', () => ({
    moduleMetadata: formlyModuleMetadata,
    template: formlyTemplate,
    props: {
      model: {},
      form: new FormGroup({}),
      fields: <FormlyFieldConfig[]>[
        {
          key: "checked",
          type: "checkbox",
          defaultValue: false,
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: "Make required"
          }
        },
        {
          key: 'howActive',
          type: 'input',
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: 'Title',
            appearance: 'outline'
          },
          expressionProperties: {
            'templateOptions.required': 'model.checked'
          }
        }
      ]
    }
  }));
