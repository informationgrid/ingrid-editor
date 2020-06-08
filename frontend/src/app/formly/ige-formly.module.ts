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
import {LeafletTypeComponent} from './types/map/leaflet-type.component';
import {FormlyMatDatepickerModule} from '@ngx-formly/material/datepicker';
import {TableTypeComponent} from './types/table-type.component';
import {CommonModule} from '@angular/common';
import {MatPopoverEditModule} from '@angular/material-experimental/popover-edit';
import {FormFieldsModule} from '../form-fields/form-fields.module';
import {DocReferenceTypeComponent} from './types/doc-reference-type.component';
import {TreeSelectDialog} from '../+form/dialogs/tree-select/tree-select.dialog';
import {SharedModule} from '../shared/shared.module';
import {AddressTypeComponent} from './types/address-type/address-type.component';
import {AddressCardComponent} from './types/address-type/address-card/address-card.component';
import {ChooseAddressDialogComponent} from './types/address-type/choose-address-dialog/choose-address-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {CodelistPipe} from '../directives/codelist.pipe';
import {MatMenuModule} from '@angular/material/menu';
import { SpatialDialogComponent } from './types/map/spatial-dialog/spatial-dialog.component';
import { SpatialListComponent } from './types/map/spatial-list/spatial-list.component';

export function IpValidator(control: FormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : {'ip': true};
}

@NgModule({
  imports: [
    CommonModule,
    MatInputModule, ReactiveFormsModule, FormsModule,
    FlexLayoutModule,
    MatDialogModule, MatButtonModule, MatAutocompleteModule, MatIconModule, MatSelectModule, MatDividerModule, MatListModule,
    MatTableModule, MatPopoverEditModule, MatCardModule,
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
        name: 'address-card',
        component: AddressTypeComponent
      }, {
        name: 'doc-reference',
        component: DocReferenceTypeComponent
      }],
      validators: [
        {name: 'ip', validation: IpValidator}
      ],
      validationMessages: [
        {name: 'required', message: 'Dieses Feld muss ausgefüllt sein'}
      ]/*,
      wrappers: [
        { name: 'panel', component: OneColumnWrapperComponent },
      ]*/
    }), FormFieldsModule,
    SharedModule, MatMenuModule
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de-DE'
    }
  ],
  declarations: [
    CodelistPipe,
    ContextHelpComponent, AutocompleteTypeComponent, LeafletTypeComponent,
    TableTypeComponent, DocReferenceTypeComponent, TreeSelectDialog, AddressTypeComponent,
    AddressCardComponent, ChooseAddressDialogComponent, SpatialDialogComponent, SpatialListComponent
  ],
  entryComponents: [ContextHelpComponent, TreeSelectDialog],
  exports: [
    ReactiveFormsModule, FormsModule,
    FormlyModule,
    ContextHelpComponent
  ]
})
export class IgeFormlyModule {
}
