import {NgModule} from '@angular/core';
import {FormControl, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {IgeFormModule} from '../+form/ige-form.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MAT_DATE_LOCALE,
  MatAutocompleteModule,
  MatButtonModule,
  MatDialogModule, MatDividerModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatSelectModule, MatTableModule
} from '@angular/material';
import {MatPopoverEditModule} from '@angular/material-experimental/popover-edit';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FormlyModule} from '@ngx-formly/core';
import {ContextHelpComponent} from '../+demo-layout/form/context-help/context-help.component';
import {AutocompleteTypeComponent} from './types/autocomplete-type.component';
import {LeafletTypeComponent} from './types/leaflet-type.component';
import {FocusDirective} from '../directives/focus.directive';
import {FormlyMatDatepickerModule} from '@ngx-formly/material/datepicker';
import {TableTypeComponent} from './types/table-type.component';

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
    MatTableModule, MatPopoverEditModule,
    FormlyMaterialModule, FormlyMatDatepickerModule,
    FormlyModule.forChild({
      types: [{
        name: 'autocomplete',
        component: AutocompleteTypeComponent,
        wrappers: ['form-field']
      }, {
        name: 'leaflet',
        component: LeafletTypeComponent/*,
        wrappers: ['form-field']*/
      }, {
        name: 'table',
        component: TableTypeComponent/*,
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
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de-DE'
    }
  ],
  declarations: [ContextHelpComponent, AutocompleteTypeComponent, LeafletTypeComponent, TableTypeComponent, FocusDirective],
  entryComponents: [ContextHelpComponent],
  exports: [
    ReactiveFormsModule,
    FormlyModule
  ]
})
export class IgeFormlyModule {
}
