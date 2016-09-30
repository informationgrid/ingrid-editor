import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicFieldComponent} from './dynamic-field.component';
import {FormToolbarComponent} from './toolbar/form-toolbar.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {DynamicFormComponent} from './dynamic-form.component';
import {LeafletComponent} from './leaflet/leaflet.component';
import {CustomInput} from './table/table.component';
import {routing} from './ige-form.routing';
import {ModalModule} from 'ng2-modal';
import {BrowserComponent} from './sidebars/browser/browser.component';
import {AgGridModule} from 'ag-grid-ng2';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, routing, ModalModule, AgGridModule.forRoot()],
  declarations: [FormToolbarComponent, DynamicFieldComponent, CustomInput, BrowserComponent, LeafletComponent, DynamicFormComponent],
  exports: []
})
export class IgeFormModule {
}
