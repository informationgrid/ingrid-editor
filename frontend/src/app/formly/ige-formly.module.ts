import {NgModule} from '@angular/core';
import {FormControl, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {IgeFormModule} from '../+form/ige-form.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatDialogModule, MatDividerModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatSelectModule
} from '@angular/material';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FormlyModule} from '@ngx-formly/core';
import {ContextHelpComponent} from '../+demo-layout/form/context-help/context-help.component';
import {AutocompleteTypeComponent} from './types/autocomplete-type.component';
import {LeafletTypeComponent} from './types/leaflet-type.component';
import {FocusDirective} from '../directives/focus.directive';

function IpValidator(control: FormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : {'ip': true};
}

@NgModule({
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    IgeFormModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatDialogModule, MatButtonModule, MatAutocompleteModule, MatIconModule, MatSelectModule, MatDividerModule, MatListModule,
    FormlyMaterialModule,
    FormlyModule.forChild({
      types: [{
        name: 'autocomplete',
        component: AutocompleteTypeComponent,
        wrappers: ['form-field']
      }, {
        name: 'leaflet',
        component: LeafletTypeComponent/*,
        wrappers: ['form-field']*/
      }],
      validators: [
        {name: 'ip', validation: IpValidator}
      ],
      validationMessages: [
        {name: 'ip', message: 'This is not a valid IP Address'}
      ]/*,
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ]*/
    })
  ],
  declarations: [ContextHelpComponent, AutocompleteTypeComponent, LeafletTypeComponent, FocusDirective],
  entryComponents: [ContextHelpComponent],
  exports: [
    ReactiveFormsModule,
    FormlyModule
  ]
})
export class IgeFormlyModule {
}
