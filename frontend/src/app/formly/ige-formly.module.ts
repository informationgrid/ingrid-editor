import {NgModule} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FormlyModule} from '@ngx-formly/core';
import {ContextHelpComponent} from '../+demo-layout/form/context-help/context-help.component';
import {AutocompleteTypeComponent} from './types/autocomplete-type.component';
import {LeafletTypeComponent} from './types/leaflet-type.component';
import {FocusDirective} from '../directives/focus.directive';
import {FormlyMatDatepickerModule} from '@ngx-formly/material/datepicker';
import {TableTypeComponent} from './types/table-type.component';
import {CommonModule} from '@angular/common';
import {MatPopoverEditModule} from '@angular/material-experimental/popover-edit';
import {NgxDatatableTypeComponent} from './types/ngx-datatable-type.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

export function IpValidator(control: FormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : {'ip': true};
}

@NgModule({
  imports: [
    CommonModule,
    MatInputModule, ReactiveFormsModule, FormsModule,
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
        component: TableTypeComponent
      }, {
        name: 'ngx-table',
        component: NgxDatatableTypeComponent
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
    }), NgxDatatableModule
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de-DE'
    }
  ],
  declarations: [ContextHelpComponent, AutocompleteTypeComponent, LeafletTypeComponent, NgxDatatableTypeComponent, TableTypeComponent, FocusDirective],
  entryComponents: [ContextHelpComponent],
  exports: [
    ReactiveFormsModule, FormsModule,
    FormlyModule,
    ContextHelpComponent
  ]
})
export class IgeFormlyModule {
}
